<#
.SYNOPSIS
    Native safe launcher for Antigravity (agy).
.DESCRIPTION
    This launcher ensures agy runs with strict safe defaults, avoiding dangerous flags
    and automatically mapping tiers to specific models and effort levels.
.PARAMETER Prompt
    The required task prompt to execute.
.PARAMETER Tier
    The intelligence tier to use: 'flash' or 'pro'.
.PARAMETER Mode
    The operating mode: 'plan' or 'accept-edits'.
.EXAMPLE
    .\start-agy.ps1 -Prompt "Update the README" -Tier flash -Mode plan
#>

param(
    [Parameter(Mandatory=$true, HelpMessage="Task prompt for agy")]
    [string]$Prompt,

    [Parameter(Mandatory=$true, HelpMessage="Intelligence tier (flash|pro)")]
    [ValidateSet('flash', 'pro')]
    [string]$Tier,

    [Parameter(Mandatory=$true, HelpMessage="Operating mode (plan|accept-edits)")]
    [ValidateSet('plan', 'accept-edits')]
    [string]$Mode
)

if ($null -eq (Get-Command "agy" -ErrorAction SilentlyContinue)) {
    Write-Error "Error: 'agy' executable is not found in PATH. Please verify your Antigravity installation."
    exit 1
}

if ($Tier -eq 'flash') {
    $ModelName = 'gemini-3.7-flash-high'
    $Effort = 'high'
} else {
    $ModelName = 'gemini-3.1-pro-high'
    $Effort = 'high'
}

# Construct the argument list ensuring safe defaults.
# --sandbox and --prompt-interactive are always applied.
# --dangerously-skip-permissions and --print are strictly avoided.
$agyArgs = @(
    "--model", $ModelName,
    "--effort", $Effort,
    "--mode", $Mode,
    "--sandbox",
    "--prompt-interactive", $Prompt
)

& agy $agyArgs

exit $LASTEXITCODE
