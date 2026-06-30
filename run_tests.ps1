# Test script for Gradio 5 chat via agent-browser
# Prerequisite: isTrusted patched on page, text set via native setter

$SCREENSHOT_DIR = "C:\20scrape\test_screenshots"

# Helper function
function Send-Message {
    param($message, $waitSeconds = 20, $screenshotName)
    
    # Set text via native setter + events
    $escaped = $message -replace '"','\"' -replace "`n"," " -replace "`r",""
    agent-browser eval "(function(){ const ta=document.querySelector('textarea'); const ns=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set; ns.call(ta,'$escaped'); ta.dispatchEvent(new Event('input',{bubbles:true})); ta.dispatchEvent(new Event('change',{bubbles:true})); return ta.value })()" 2>&1 | Out-Null
    
    # Click submit
    agent-browser eval "(function(){ const btn=document.querySelector('.submit-button'); if(btn){btn.click();return'ok'} return'fail' })()" 2>&1 | Out-Null
    
    # Wait
    Start-Sleep -Seconds $waitSeconds
    
    # Screenshot
    if ($screenshotName) {
        agent-browser screenshot "$SCREENSHOT_DIR\$screenshotName" 2>&1 | Out-Null
    }
    
    # Read response
    $result = agent-browser eval "(function(){ const log=document.querySelector('[role=log]'); const paras=log?.querySelectorAll('p'); const last=paras?[paras.length-1]; return last?.textContent?.substring(0,300) || 'no response' })()" 2>&1
    return $result
}

function Patch-IsTrusted {
    agent-browser eval "(function(){ Object.defineProperty(Event.prototype,'isTrusted',{get:function(){return true}}) })()" 2>&1 | Out-Null
}

# ========== RUN TESTS ==========

Write-Host "=== Test 1: Greeting ==="
agent-browser reload 2>&1 | Out-Null
Start-Sleep -Seconds 2
Patch-IsTrusted
$r1 = Send-Message -message "สวัสดี" -waitSeconds 10 -screenshotName "01_greeting.png"
Write-Host "Result: $r1"

Write-Host ""
Write-Host "=== Test 2: Shipping rate ==="
agent-browser reload 2>&1 | Out-Null
Start-Sleep -Seconds 2
Patch-IsTrusted
$r2 = Send-Message -message "ส่งของไปเชียงใหม่ 1kg" -waitSeconds 25 -screenshotName "02_shipping.png"
Write-Host "Result: $r2"

Write-Host ""
Write-Host "=== Test 3: Schedule ==="
agent-browser reload 2>&1 | Out-Null
Start-Sleep -Seconds 2
Patch-IsTrusted
$r3 = Send-Message -message "ร้านเปิดกี่โมง" -waitSeconds 15 -screenshotName "03_schedule.png"
Write-Host "Result: $r3"

Write-Host ""
Write-Host "=== Test 4: Edge case - missing info ==="
agent-browser reload 2>&1 | Out-Null
Start-Sleep -Seconds 2
Patch-IsTrusted
$r4 = Send-Message -message "คิดค่าส่งอย่างเดียว" -waitSeconds 15 -screenshotName "04_edge.png"
Write-Host "Result: $r4"

Write-Host ""
Write-Host "=== Test 5: Static QR request ==="
agent-browser reload 2>&1 | Out-Null
Start-Sleep -Seconds 2
Patch-IsTrusted
$r5 = Send-Message -message "ขอ qr promptpay เบอร์ 0891234567" -waitSeconds 20 -screenshotName "05_static_qr.png"
Write-Host "Result: $r5"

Write-Host ""
Write-Host "Done! Screenshots in $SCREENSHOT_DIR"
