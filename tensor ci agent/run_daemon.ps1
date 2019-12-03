#requires -version 5.1
<#
.SYNOPSIS
 This script is meant to serve as a Continuous Integration/Continuous Delivery agent which will automatically respond to new data in a designated location, and process the data against a trained tensor model
.NOTES
 We had a lot of issues getting Tensorflow working with the provided trained models. This is meant to serve as not only a daemon for dynamically responding to new potential target images, it will also allow developers to have a fast-feedback loop when developing new tensors
.PARAMETER config_root
    This is the location of the configuration file which run_daemon.ps1 will look for the config_filename
.PARAMETER config_filename
    This is the name of the config ini file which auto_make.ps1 will read. This will default to config.ini
.PARAMETER import_only
    If set this flag will cause the functions to be IMPORTED ONLY, and the dameon WILL NOT START automatically  
.PARAMETER as_job
    If set this flag will run the daemon as a background job and output to a log file
.NOTES
  Version:        1
  Author:         Amelia Wietting
  Creation Date:  20191203
  Purpose/Change: Initial version of this CI script
  
.EXAMPLE
  powershell.exe .\auto_make.ps1
#>

param (
    [string]$config_root = ".\",
    [string]$config_filename = "config.ini",
    [switch]$import_only = $false,
    [switch]$as_job = $false
)

if($(Get-ExecutionPolicy) -ne "Bypass"){
    Set-ExecutionPolicy Bypass -Scope CurrentUser -Force
}

function read_config($config_root,$config_filename) 
{
    # Fetch all the info from our config file and return it in a hashtable
    $config_root = $(Get-ChildItem $config_root)[-1].DirectoryName
    Push-Location $config_root
    
    #$app_list = Get-ChildItem $config_root\app*\*main.c -Recurse
    $config_file = Get-ChildItem .\$config_filename
    
    if ($config_file.Count -lt 1) {
        Write-Host 'Unable to find config.ini!!!'
        return 0
    } else {
        $settings = Get-IniContent .\$config_filename
    }
    
    return $settings
}

function run_daemon()
{
    # Create our main app list from our config
    param (
        [string]$config_root,
        [string]$config_filename
        )
    # Read our configuration file
    $config = read_config -config_root $config_root -config_filename $config_filename

    # Create empty hashtable to use as a psuedo-object
    $main_file_list = @{}

    # Loop through the different apps in the configuration file 
    $config.Keys | % {
        $main_file_list += @{
            "$($_)" = @{
                "config_root_folder" = $config.$_.config_root_folder
                "input_image_filepath" = $config.$_.input_image_filepath
                "tensor_image_filepath" = $config.$_.tensor_image_filepath
                "game_image_filepath" = $config.$_.game_image_filepath
                "positive_archive_image_filepath" = $config.$_.positive_archive_image_filepath
                "negative_archive_image_filepath" = $config.$_.negative_archive_image_filepath
            }
        }
    }    
    # Start the daemon. Using the $true allows us to just "Ctrl+C" to exit the script
    while($true) {
        $main_file_list.Keys | % { 

            # Get the objet for each key
            $loop_item = $main_file_list.$_

            # Set the input folder as our root folder
            Push-Location $loop_item.input_image_filepath
            $list = Get-ChildItem .\ -Recurse

            if($List.Count -gt 0){
                # We have new images from the Sentinel that we need to check!
                $list | ForEach-Object {
                    Write-Host("Found new image in our images folder: $($_.Name)")
                    Write-Host("Compairing against tensor...")

                    # Check image against tensor file
                    $cmd = "python .\path_to_compare_tensor_python_script.py $($_.FullName)"

                    # Once this python script is working, uncomment the Invoke-Expression line
                    [switch] $output = $true
                    # $output = Invoke-Expression $cmd

                    if($output){
                        # Tensor came back saying that this is a positive hit! Move the pic to the game input folder for end users to play with
                        if(!(Test-Path $loop_item.tensor_image_filepath)){
                            New-Item $loop_item.tensor_image_filepath -ItemType Directory
                        }
                        Write-Host "Tensor compare came back POSITIVE, moved $($_.Name) to be injected in to game for players to review" -ForegroundColor Black -BackgroundColor Blue
                        Copy-Item $_.FullName -Destination "$($loop_item.tensor_image_filepath)\$($_.Name)"
                        Remove-Item $_.FullName
                    } else {
                        Write-Host "Tensor compare came back NEGATIVE, moved $($_.Name) to negative archive for retraining" -ForegroundColor Black -BackgroundColor Red
                        if(!(Test-Path $loop_item.negative_archive_image_filepath)){
                            New-Item $loop_item.negative_archive_image_filepath -ItemType Directory
                        }
                        Copy-Item $_.FullName -Destination "$($loop_item.negative_archive_image_filepath)\$($_.Name)"
                        Remove-Item $_.FullName
                    }
                }
            }

            Pop-Location
            
            # Set the input folder as our root folder
            $game_list = Get-ChildItem $loop_item.game_image_filepath -Recurse -ErrorAction SilentlyContinue
            
            if($game_list.Count -gt 0){
                Push-Location $loop_item.game_image_filepath
                # We have new images from the Sentinel that we need to check!
                $game_list | ForEach-Object {
                    Write-Host("Found new image in our game identified folder: $($_.Name)")
                    
                    Write-Host "Training Tensor using new file $($_.Name)" -ForegroundColor Black -BackgroundColor Blue
                    # Check image against tensor file
                    $cmd = "python .\path_to_train_tensor_python_script.py $($_.FullName)"
                    
                    # Once this python script is working, uncomment the Invoke-Expression line
                    [switch] $output = $true
                    # $output = Invoke-Expression $cmd
                    
                    if($output){
                        # Tensor trained successfully!
                        Write-Host("Moving trained file to POSITIVE archive")
                        if(!(Test-Path $loop_item.positive_archive_image_filepath)){
                            New-Item $loop_item.positive_archive_image_filepath -ItemType Directory
                        }
                        Copy-Item "$($_.FullName)" -Destination "$($loop_item.positive_archive_image_filepath)\$($_.Name)"
                        Remove-Item $_.FullName
                        
                    } else {
                        Write-Host("Moving trained file to NEGAtIVE archive")
                        if(!(Test-Path $loop_item.negative_archive_image_filepath)){
                            New-Item $loop_item.negative_archive_image_filepath -ItemType Directory
                        }
                        Copy-Item "$($_.FullName)" -Destination "$($loop_item.negative_archive_image_filepath)\$($_.Name)"
                        Remove-Item $_.FullName
                    }
                }
            }
            Pop-Location
        }
        Write-Host "Waiting for new images..."
        Start-Sleep 5
    }
}

function Get-IniContent ($filePath)
{
    # Good ol TechGallery
    # https://gallery.technet.microsoft.com/scriptcenter/ea40c1ef-c856-434b-b8fb-ebd7a76e8d91
    
    $ini = @{}
    switch -regex -file $FilePath
    {
        "^\[(.+)\]" # Section
        {
            $section = $matches[1]
            $ini[$section] = @{}
            $CommentCount = 0
        }
        "^(;.*)$" # Comment
        {
            $value = $matches[1]
            $CommentCount = $CommentCount + 1
            $name = “Comment” + $CommentCount
            $ini[$section][$name] = $value
        }
        "(.+?)\s*=(.*)" # Key
        {
            $name,$value = $matches[1..2]
            $ini[$section][$name] = $value
        }
    }
    return $ini
}

if ($import_only) {
    Write-Host "Successfully imported functions from run_daemon.ps1!!!"
} elseif ($as_job) {
    # Get the run_daemon file location
    $filepath = $(Get-ChildItem .\run_daemon.ps1).DirectoryName

    Write-Host "Starting the SPILLTRUTH CI Daemon..."
    
    # Start the job
    $job = Start-Job -ArgumentList $filepath -ScriptBlock {
        Set-Location $args[0]
        powershell .\run_daemon.ps1 | Out-File .\spilltruth_daemon.log -Append
    } 
    # Instruct users on how to end this daemon
    Write-Host "To end this daemon, please run: `n
    Stop-Job -Id $($job.Id)`n"
} else {
    # Run the daemon
    Write-Host "Daemon starting up..."
    run_daemon -config_root $config_root -config_filename $config_filename
}