@echo off
if "%SAUCE_USERNAME%"=="" GOTO :username-missing
if "%SAUCE_ACCESS_KEY%"=="" GOTO :access-key-missing
bin\sauceconnect  -u %SAUCE_USERNAME% -k %SAUCE_ACCESS_KEY% --proxy-tunnel  --no-autodetect -i "%SAUCE_USERNAME%'s Tunnel"
GOTO :eof
:username-missing
    echo [91m ERROR : SAUCE_USERNAME is not defined. Please read the documentation to find out how to set it. [0m
    GOTO :eof
:access-key-missing
    echo [91m ERROR : SAUCE_ACCESS_KEY is not defined. Please read the documentation to find out how to set it.[0m
