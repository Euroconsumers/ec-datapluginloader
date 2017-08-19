@echo off
cls

set widgetname=ec-datapluginloader
for /f "tokens=2*" %%i in ('node -p "require('./package.json').version"') do set widgetversion=%%i 
set cdnpath=http://svn.belux.conseur.org/svn/repository/projects/internet/Euroconsumers.Cdn.Patterns/PRO/

@echo.
@echo _______________________________________________________________________
@echo CHECK OUT CDN REPOSITORY 
@echo -----------------------------------------------------------------------
@echo.

rmdir %~dp0_dist\ /s /q
call svn checkout %cdnpath%/vendor/euroconsumers/%widgetname%/ _dist
if %errorlevel% neq 0 exit /b %errorlevel%

@echo.
@echo _______________________________________________________________________
@echo TODO: Bump the version ? Add param to not bump version instead? Tag git with version number?
@echo -----------------------------------------------------------------------
@echo.

@echo.
@echo _______________________________________________________________________
@echo BUILD DISTRIBUTABLE
@echo -----------------------------------------------------------------------
@echo.

call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%

@echo.
@echo _______________________________________________________________________
@echo COMMIT TO CDN REPOSITORY
@echo -----------------------------------------------------------------------
@echo.

call svn status _dist
if %errorlevel% neq 0 exit /b %errorlevel%

IF /I NOT [%1]==[WithCommit] (
	goto skipCommit
) 

for /f "tokens=2*" %%i in ('svn status _dist ^| find "?"') do svn add "%%i"  
for /f "tokens=2*" %%i in ('svn status _dist ^| find "!"') do svn delete "%%i"  
call svn commit _dist -m "[%widgetname%] Released v%widgetversion%"
if %errorlevel% neq 0 exit /b %errorlevel%


goto afterskipCommit
:skipCommit
@echo.
@echo     !! SKIPPED COMMIT !!
:afterskipCommit

@echo.
@echo _______________________________________________________________________
@echo DONE for %widgetname%
@echo -----------------------------------------------------------------------
@echo.
