import binascii
import hashlib
import hmac
import json
import os
import requests
import signal
import socket
import time
import tornado.escape
import tornado.httpclient
import tornado.httpserver
import tornado.ioloop
import tornado.iostream
import tornado.options
import tornado.web

from ais import nmea_queue
from tornado.options import define, options

curr_dir = os.path.dirname(os.path.realpath(__file__))

auths = {
    "spill": "MakeItWork42!",
}


# Empty Context class to allow dot notation
class Context:
    pass


class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        user_id = self.get_secure_cookie("user_id")
        if user_id:
            return user_id.decode()
        else:
            return None

class MainHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.redirect("/web/index.html")

class LoginHandler(BaseHandler):
    def initialize(self, ctx):
        self.users = ctx.db["users"]

    def get(self):
        self.render(curr_dir + "/web/login.html")

    def post(self):
        global auths

        username = self.get_argument("username")
        password = self.get_argument("password")

        if (username in auths and password == auths[username]):
            # TODO: log user access
            for user_id, user_obj in self.users.items():
                if user_obj["username"] == username:
                    self.set_secure_cookie("user_id", user_id)
                    self.redirect("/")
        else:
            # TODO: log failed attempt
            self.set_status(401, "Invalid username or password")
            error_message = "Invalid username or password"
            self.render(curr_dir + "/web/login.html", errorMessage=error_message)

        # TODO: return response

class LogoutHandler(BaseHandler):
    #@tornado.web.authenticated
    def get(self):
        self.clear_cookie("user")
        self.redirect("/login")

class WebHandler(BaseHandler):
    def get(self):
        self.redirect("/web/index.html")

class UserInfoHandler(BaseHandler):
    def initialize(self, ctx):
        self.users = ctx.db["users"]

    @tornado.web.authenticated
    def get(self):
        response = json.dumps(self.users[self.current_user])
        self.write(response)

class UsersHandler(BaseHandler):
    # TODO - stub
    pass

class UserGroupsHandler(BaseHandler):
    # TODO - stub
    pass

class CamerasHandler(BaseHandler):
    def initialize(self, ctx):
        self.users = ctx.db["users"]
        self.ugroups = ctx.db["ugroups"]
        self.cameras = ctx.db["cameras"]
        self.cgroups = ctx.db["cgroups"]

    @tornado.web.authenticated
    def get(self):
        user_obj = self.users[self.current_user]
        cameras = {}
        for ugroup in user_obj["ugroups"]:
            for cgroup in self.ugroups[ugroup]["cgroups"]:
                for cid in self.cgroups[cgroup]["cameras"]:
                    # cameras.update({cid: self.cameras[cid]})
                    cameras[cid] = self.cameras[cid]

        print(cameras)

        response = json.dumps(cameras)
        self.write(response)
        # TODO: self.flush()??

class CameraGroupsHandler(BaseHandler):
    # TODO - stub
    pass

class FavoritesHandler(BaseHandler):
    def initialize(self, ctx):
        self.users = ctx.db["users"]
        self.cameras = ctx.db["cameras"]

    @tornado.web.authenticated
    def get(self):
        user_obj = self.users[self.current_user]
        #favorites = {}
        #for cid in user_obj["favorites"]:
            #favorites[cid] = self.cameras[cid]
        favorites = user_obj["favorites"]

        response = json.dumps(favorites)
        self.write(response)

    @tornado.web.authenticated
    def post(self):
        user_obj = self.users[self.current_user]

        # TODO: loads and decode vs tornado.escape.json_decode()??
        request_data = json.loads(self.request.body.decode())
        user_obj["favorites"] = request_data
        # TODO: write out to users.json

class TokenHandler(BaseHandler):
    def initialize(self, ctx):
        self.users = ctx.db["users"]
        self.ugroups = ctx.db["ugroups"]
        self.cameras = ctx.db["cameras"]
        self.cgroups = ctx.db["cgroups"]
        self.tokens = ctx.tokens
        self.secret = ctx.secret

    @tornado.web.authenticated
    async def get(self):
        query_cid = self.get_query_argument("cid")
        user_obj = self.users[self.current_user]

        # Check if user has access to the requested camera
        if not is_authorized(user_obj, query_cid, self.ugroups, self.cgroups):
            self.set_status(403)
            self.finish()
            return

        key = '-'.join([self.current_user, query_cid])
        endpoint_url = self.cameras[query_cid]["mjpeg_info"]["url"] + "/api/v1"

        http_client = tornado.httpclient.AsyncHTTPClient()

        if self.request.path == "/cameras/createtoken":
            headers = create_signed_header(self.secret)
            request_data = {
                "request": "create_token",
                "cid": query_cid,
                "expires": int(time.time()) + 3600,     # token valid for 1 hour
                "channel": 1,
                "max_fps": 15
            }
            resp = await http_client.fetch(endpoint_url, method="POST", body=json.dumps(request_data), headers=headers)
            resp = json.loads(resp.body.decode())

            self.tokens[key] = {
                "tid": resp["token"],
                "expires": resp["expires"]
            }

            token_info = {
                "token": resp["token"],
                "endpoint_url": self.cameras[query_cid]["mjpeg_info"]["url"]
            }
            # TODO: maybe json.dumps() isn't necessary for a dictionary?
            response = json.dumps(token_info)
            self.write(response)

        elif self.request.path == "/cameras/renewtoken":
            if key not in self.tokens:
                self.set_status(404)
                self.finish()
                return

            token = self.tokens[key]
            token["expires"] = int(time.time()) + 3600      # valid for 1 hour

            headers = create_signed_header(self.secret)
            request_data = {
                "request": "renew_token",
                "token": token["tid"],
                "expires": token["expires"]
            }
            resp = await http_client.fetch(endpoint_url, method="POST", body=json.dumps(request_data), headers=headers)
            resp = json.loads(resp.body.decode())

            token_info = {
                "token": resp["token"],
                "endpoint_url": self.cameras[query_cid]["mjpeg_info"]["url"]
            }
            response = json.dumps(token_info)
            self.write(response)

class AISHandler(BaseHandler):
    def initialize(self, ctx):
        self.ais_data = ctx.ais_data

    @tornado.web.authenticated
    def get(self):
        response = json.dumps(self.ais_data)
        self.write(response)

class AuthedStaticFileHandler(tornado.web.StaticFileHandler):
    def get_current_user(self):
        user_id = self.get_secure_cookie("user_id")
        if user_id:
            return user_id.decode()
        else:
            return None

    @tornado.web.authenticated
    def prepare(self):
        pass


def load_memory():
    database = {}
    with open('users.json', 'r') as f:
        database["users"] = json.load(f)
    with open('ugroups.json', 'r') as f:
        database["ugroups"] = json.load(f)
    with open('cameras.json', 'r') as f:
        database["cameras"] = json.load(f)
    with open('cgroups.json') as f:
        database["cgroups"] = json.load(f)
    return database

def load_jpeg_config():
    with open('jpeg_servers_config.json', 'r') as f:
        jpeg_servers = json.load(f)
    return jpeg_servers

def load_secret(filename = curr_dir + "/comm.key"):
    with open(filename, 'rb') as f:
        return f.read()

def create_signed_header(secret):
    ts = str(int(time.time()))
    rand = binascii.b2a_hex(os.urandom(16)).decode()
    to_sign = '\n'.join([ts, rand]).encode()
    signature = hmac.HMAC(secret, to_sign, digestmod=hashlib.md5).hexdigest()
    headers = {
        "X-TV-Timestamp": ts,
        "X-TV-Random": rand,
        "Authorization": "TV-HMAC " + signature
    }

    return headers

def is_authorized(user_obj, cid, ugroups, cgroups):
    for ugroup in user_obj["ugroups"]:
        for cgroup in ugroups[ugroup]["cgroups"]:
            if cid in cgroups[cgroup]["cameras"]:
                # User has access to this camera
                return True

    # User does not have access to this camera
    return False

async def jpeg_set_cameras(jpeg_servers, cameras, secret):
    for server in jpeg_servers:
        endpoint_url = server + "/api/v1"
        server_cameras = []
        for cid in cameras:
            info = cameras[cid]["mjpeg_info"]
            if info["url"] == server:
                server_cameras.append({
                    "cid": cid,
                    "xtra_args": info["xtra_args"],
                    "source": info["source"],
                    "outputs": info["outputs"]
                })

        headers = create_signed_header(secret)
        request_data = {
            "request": "set_camera",
            "cameras": server_cameras
        }
        http_client = tornado.httpclient.AsyncHTTPClient()
        resp = await http_client.fetch(endpoint_url, method="POST", body=json.dumps(request_data), headers=headers)

async def get_ais_data(sock, ais_data):
    stream = tornado.iostream.IOStream(sock)
    stream.connect()
    msg_queue = nmea_queue.NmeaQueue()
    while True:
        msg_bytes = await stream.read_until(b"\n")
        msg = msg_bytes.decode()
        if msg:
            msg_queue.put(msg)
            result = msg_queue.GetOrNone()
            if result and "decoded" in result:
                decoded = result["decoded"]
                mmsi = str(decoded["mmsi"])
                if mmsi not in ais_data:
                    ais_data[mmsi] = {}
                for key, value in decoded.items():
                    ais_data[mmsi][key] = value
                ais_data[mmsi]["last_seen"] = int(time.time())


# Command line options
define("port", default=8888, help="port to listen on", type=int)
define("ssl", default=0, help="enable ssl", type=int)

def main():
    ctx = Context()
    ctx.http_server = None

    def shutdown():
        if ctx.http_server:
            ctx.http_server.stop()
        tornado.ioloop.IOLoop.current().stop()

    def exit_handler(sig, frame):
        tornado.ioloop.IOLoop.instance().add_callback_from_signal(shutdown)

    #options.logging = None     # TODO: uncomment if configuring logging myself
    tornado.options.parse_command_line()

    signal.signal(signal.SIGTERM, exit_handler)
    signal.signal(signal.SIGINT, exit_handler)

    ctx.db = load_memory()
    ctx.tokens = {}
    ctx.ais_data = {}
    # ctx.secret = load_secret()

    jpeg_servers = load_jpeg_config()

    settings = {
        "debug": True,
        "cookie_secret": "__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
        "login_url": "/login",
        # TODO: set xsrf_cookies to True
        "xsrf_cookies": False,
        "compress_response": True,
        "static_path": os.path.join(os.path.dirname(__file__), "web", "static"),
        "static_handler_args": dict(default_filename="index.html"),
    }

    urls = [
        (r"/", MainHandler),
        (r"/web/(.*)", AuthedStaticFileHandler, {'path': curr_dir + '/web'}),
        (r"/login", LoginHandler, dict(ctx=ctx)),
        (r"/logout", LogoutHandler),
        (r"/web", WebHandler),
        (r"/userinfo", UserInfoHandler, dict(ctx=ctx)),
        (r"/users", UsersHandler),
        (r"/users/groups", UserGroupsHandler),
        (r"/cameras", CamerasHandler, dict(ctx=ctx)),
        (r"/cameras/groups", CameraGroupsHandler),
        (r"/cameras/favorites", FavoritesHandler, dict(ctx=ctx)),
        (r"/cameras/createtoken", TokenHandler, dict(ctx=ctx)),
        (r"/cameras/renewtoken", TokenHandler, dict(ctx=ctx)),
        (r"/ais", AISHandler, dict(ctx=ctx)),
    ]

    application = tornado.web.Application(urls, **settings)
    #application.listen(options.port)
    if options.ssl > 0:
        ctx.http_server = tornado.httpserver.HTTPServer(application, ssl_options={
            "certfile": "/home/tvdev/certs/fullchain.pem",
            "keyfile": "/home/tvdev/certs/privkey.pem"
        })
    else:
        ctx.http_server = tornado.httpserver.HTTPServer(application)

    ctx.http_server.listen(options.port)

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    io_loop = tornado.ioloop.IOLoop.current()
    io_loop.add_callback(get_ais_data, sock, ctx.ais_data)
#    io_loop.add_callback(jpeg_set_cameras, jpeg_servers, ctx.db["cameras"], ctx.secret)
    io_loop.start()

if __name__ == "__main__":
    main()
