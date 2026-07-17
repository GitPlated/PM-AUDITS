$ErrorActionPreference = "Stop"

$SupabaseUrl = "https://uluphbceprgwcpoubvmn.supabase.co"
$ApiKey = "sb_publishable_R4IwhaljVtGFZKy2gQ51XA_WKz_y9uT"

$headers = @{
    apikey        = $ApiKey
    Authorization = "Bearer $ApiKey"
    "Content-Type" = "application/json"
    "Prefer"       = "return=representation"
}

$findings = @(
    @{ technician_name="Jessy Rodriguez"; leader_name="Tyler Christensen"; pm_task="Daily PM - Conveyor Line 2, occurrence 496858"; occurrence_date="2026-07-15"; occurrence_url="https://hellofresh.gofmx.com/planned-maintenance/tasks/496858/occurrences/2026-07-15"; reason_given="Not able to execute PM due to machine being in use all day."; is_critical_pm=$true; reported_by="Jacob Cabrales" }
    @{ technician_name="Francisco Chavez"; leader_name="Tyler Christensen"; pm_task="Daily PM - Case Erector 1"; occurrence_date="2026-07-10"; occurrence_url=$null; reason_given="Skipped lubrication step, ran out of time before shift change."; is_critical_pm=$true; reported_by="Jacob Cabrales" }
    @{ technician_name="Adrian Escobedo"; leader_name="Tyler Christensen"; pm_task="Weekly PM - Loma Metal Detector"; occurrence_date="2026-06-28"; occurrence_url=$null; reason_given="Closed PM without verifying test piece rejection."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Eduardo Guzman"; leader_name="Tyler Christensen"; pm_task="Daily PM - MAP Machine GT1e"; occurrence_date="2026-06-20"; occurrence_url=$null; reason_given="Closed PM as complete but gas mix was never checked."; is_critical_pm=$true; reported_by="Jacob Cabrales" }
    @{ technician_name="Sergio Ortiz"; leader_name="Tyler Christensen"; pm_task="Daily PM - Bagger Line 1"; occurrence_date="2026-06-15"; occurrence_url=$null; reason_given="Machine running behind, PM deferred to next shift without notice."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Mike Fondren"; leader_name="Tyler Christensen"; pm_task="Weekly PM - AutoStore Robot Bay 3"; occurrence_date="2026-06-02"; occurrence_url=$null; reason_given="Left PM checklist blank, marked complete."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Keith Grimes"; leader_name="Tyler Christensen"; pm_task="Daily PM - Char Marker"; occurrence_date="2026-05-27"; occurrence_url=$null; reason_given="Closed PM stating grill was too hot to inspect."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Erick Sanchez"; leader_name="Tyler Christensen"; pm_task="Daily PM - Vemag Line"; occurrence_date="2026-05-18"; occurrence_url=$null; reason_given="PM closed with no photos attached, unclear if performed."; is_critical_pm=$true; reported_by="Jacob Cabrales" }
    @{ technician_name="Julian Escobedo"; leader_name="Tyler Christensen"; pm_task="Weekly PM - Zebra Printer ZT620"; occurrence_date="2026-05-05"; occurrence_url=$null; reason_given="Skipped print head cleaning step."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Gregory Turner"; leader_name="Tyler Christensen"; pm_task="Daily PM - Braiser Unit 2"; occurrence_date="2026-04-22"; occurrence_url=$null; reason_given="Ran out of time, said would finish next shift."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Andrew Brewster"; leader_name="Tyler Christensen"; pm_task="Daily PM - Grill Line"; occurrence_date="2026-04-10"; occurrence_url=$null; reason_given="Closed PM without checking char-marker calibration."; is_critical_pm=$true; reported_by="Jacob Cabrales" }

    @{ technician_name="Oscar Villalobos"; leader_name="Dave Haney"; pm_task="Daily PM - Reach Truck 5600"; occurrence_date="2026-07-12"; occurrence_url=$null; reason_given="PM closed, forklift left with low hydraulic fluid."; is_critical_pm=$true; reported_by="Jacob Cabrales" }
    @{ technician_name="John Doyle"; leader_name="Dave Haney"; pm_task="Weekly PM - Rytec PredaDoor"; occurrence_date="2026-07-01"; occurrence_url=$null; reason_given="Door sensor test skipped."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Julio Segura Jr"; leader_name="Dave Haney"; pm_task="Daily PM - 3M-Matic Case Sealer"; occurrence_date="2026-06-24"; occurrence_url=$null; reason_given="Tape head not inspected, closed as complete anyway."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Andres Mazuera"; leader_name="Dave Haney"; pm_task="Daily PM - Waukesha Pump"; occurrence_date="2026-06-11"; occurrence_url=$null; reason_given="Seal inspection skipped due to production pressure."; is_critical_pm=$true; reported_by="Jacob Cabrales" }
    @{ technician_name="Jacolby Moffett"; leader_name="Dave Haney"; pm_task="Weekly PM - Dematic Diverter 4"; occurrence_date="2026-05-30"; occurrence_url=$null; reason_given="PM logged complete with no time spent on the floor per badge data."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Tim Solof"; leader_name="Dave Haney"; pm_task="Daily PM - Yamato Scale Line 3"; occurrence_date="2026-05-14"; occurrence_url=$null; reason_given="Calibration weights not used during check."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Jason Riddle"; leader_name="Dave Haney"; pm_task="Daily PM - Fortress Metal Detector"; occurrence_date="2026-04-29"; occurrence_url=$null; reason_given="Closed PM stating detector sounded fine, no test card run."; is_critical_pm=$true; reported_by="Jacob Cabrales" }
    @{ technician_name="Maximo Hernandez"; leader_name="Dave Haney"; pm_task="Weekly PM - Combi Case Erector"; occurrence_date="2026-04-16"; occurrence_url=$null; reason_given="Glue applicator not checked."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Wyatt Talaska"; leader_name="Dave Haney"; pm_task="Daily PM - Matrix Morpheus VFFS"; occurrence_date="2026-04-02"; occurrence_url=$null; reason_given="PM closed early, said line was down for changeover."; is_critical_pm=$false; reported_by="Jacob Cabrales" }

    @{ technician_name="Angel Mejia"; leader_name="Ron Vogel"; pm_task="Daily PM - ZFA Sorter Control"; occurrence_date="2026-07-14"; occurrence_url=$null; reason_given="PM closed but sorter jam log not reviewed."; is_critical_pm=$true; reported_by="Jacob Cabrales" }
    @{ technician_name="Ariel Lopez"; leader_name="Ron Vogel"; pm_task="Weekly PM - Raymond Forklift 7500"; occurrence_date="2026-07-03"; occurrence_url=$null; reason_given="Tire wear not inspected."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Jose Aguilar"; leader_name="Ron Vogel"; pm_task="Daily PM - Little David Tape Head"; occurrence_date="2026-06-19"; occurrence_url=$null; reason_given="Tape tension not adjusted per spec."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Arnie Chavez"; leader_name="Ron Vogel"; pm_task="Daily PM - Intelligrated Conveyor"; occurrence_date="2026-06-05"; occurrence_url=$null; reason_given="Closed PM without clearing E-stop history."; is_critical_pm=$true; reported_by="Jacob Cabrales" }
    @{ technician_name="Angel Mejia"; leader_name="Ron Vogel"; pm_task="Weekly PM - IPG Case Sealer"; occurrence_date="2026-05-21"; occurrence_url=$null; reason_given="Box flap sensor not tested."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Jose Aguilar"; leader_name="Ron Vogel"; pm_task="Daily PM - Loveshaw Erector"; occurrence_date="2026-05-08"; occurrence_url=$null; reason_given="PM deferred, said tech was pulled to another line."; is_critical_pm=$false; reported_by="Jacob Cabrales" }

    @{ technician_name="Robert Knudsen"; leader_name="Wilberth Carrizal"; pm_task="Daily PM - AutoStore Grid Bay 1"; occurrence_date="2026-07-11"; occurrence_url=$null; reason_given="Closed PM without checking bin lift alignment."; is_critical_pm=$true; reported_by="Jacob Cabrales" }
    @{ technician_name="Miguel Pereira Lara"; leader_name="Wilberth Carrizal"; pm_task="Weekly PM - HVAC Rooftop Unit 3"; occurrence_date="2026-06-30"; occurrence_url=$null; reason_given="Refrigerant pressure not logged."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Ryan Lopez"; leader_name="Wilberth Carrizal"; pm_task="Daily PM - ET 2Plus Tape Head"; occurrence_date="2026-06-17"; occurrence_url=$null; reason_given="Tape head adjustment skipped."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Robert Knudsen"; leader_name="Wilberth Carrizal"; pm_task="Weekly PM - Ecolab Wash Station"; occurrence_date="2026-06-03"; occurrence_url=$null; reason_given="Sanitizer concentration not verified."; is_critical_pm=$true; reported_by="Jacob Cabrales" }
    @{ technician_name="Miguel Pereira Lara"; leader_name="Wilberth Carrizal"; pm_task="Daily PM - Cherry-Burrell Pump"; occurrence_date="2026-05-19"; occurrence_url=$null; reason_given="Seal leak noted but PM marked complete without follow-up."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
    @{ technician_name="Ryan Lopez"; leader_name="Wilberth Carrizal"; pm_task="Weekly PM - PPM Scale Calibration"; occurrence_date="2026-05-01"; occurrence_url=$null; reason_given="Calibration weights unavailable, PM closed anyway."; is_critical_pm=$false; reported_by="Jacob Cabrales" }
)

Write-Host "Inserting $($findings.Count) findings..."
$findingsJson = $findings | ConvertTo-Json -Depth 5
$insertedFindings = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/pm_findings" -Method Post -Headers $headers -Body $findingsJson
Write-Host "Inserted $($insertedFindings.Count) findings."

function Find-Id($techName, $task) {
    ($insertedFindings | Where-Object { $_.technician_name -eq $techName -and $_.pm_task -eq $task }).id
}

$actions = @(
    @{ finding_id=(Find-Id "Jessy Rodriguez" "Daily PM - Conveyor Line 2, occurrence 496858"); technician_name="Jessy Rodriguez"; leader_name="Tyler Christensen"; step="coaching"; action_date="2026-07-16"; expires_at=$null; skip_reason=$null; notes="Discussed with Jessy, documented coaching form completed."; created_by="Tyler Christensen" }
    @{ finding_id=(Find-Id "Francisco Chavez" "Daily PM - Case Erector 1"); technician_name="Francisco Chavez"; leader_name="Tyler Christensen"; step="coaching"; action_date="2026-07-11"; expires_at=$null; skip_reason=$null; notes=$null; created_by="Tyler Christensen" }
    @{ finding_id=(Find-Id "Eduardo Guzman" "Daily PM - MAP Machine GT1e"); technician_name="Eduardo Guzman"; leader_name="Tyler Christensen"; step="written_warning"; action_date="2026-06-22"; expires_at="2026-12-22"; skip_reason=$null; notes="Second occurrence in 90 days."; created_by="Tyler Christensen" }
    @{ finding_id=(Find-Id "Erick Sanchez" "Daily PM - Vemag Line"); technician_name="Erick Sanchez"; leader_name="Tyler Christensen"; step="coaching"; action_date="2026-05-19"; expires_at=$null; skip_reason=$null; notes=$null; created_by="Tyler Christensen" }
    @{ finding_id=(Find-Id "Andrew Brewster" "Daily PM - Grill Line"); technician_name="Andrew Brewster"; leader_name="Tyler Christensen"; step="written_warning"; action_date="2026-04-12"; expires_at="2026-10-12"; skip_reason=$null; notes=$null; created_by="Tyler Christensen" }
    @{ finding_id=(Find-Id "Keith Grimes" "Daily PM - Char Marker"); technician_name="Keith Grimes"; leader_name="Tyler Christensen"; step="coaching"; action_date="2026-05-28"; expires_at=$null; skip_reason=$null; notes=$null; created_by="Tyler Christensen" }
    @{ finding_id=$null; technician_name="Julian Escobedo"; leader_name="Tyler Christensen"; step="written_warning"; action_date="2026-06-01"; expires_at="2026-12-01"; skip_reason="Incorrect shift/workday - 1st occurrence per handbook table (skips documented coaching)."; notes=$null; created_by="Tyler Christensen" }

    @{ finding_id=(Find-Id "Oscar Villalobos" "Daily PM - Reach Truck 5600"); technician_name="Oscar Villalobos"; leader_name="Dave Haney"; step="coaching"; action_date="2026-07-13"; expires_at=$null; skip_reason=$null; notes=$null; created_by="Dave Haney" }
    @{ finding_id=(Find-Id "Andres Mazuera" "Daily PM - Waukesha Pump"); technician_name="Andres Mazuera"; leader_name="Dave Haney"; step="written_warning"; action_date="2026-06-13"; expires_at="2026-12-13"; skip_reason=$null; notes=$null; created_by="Dave Haney" }
    @{ finding_id=(Find-Id "Jason Riddle" "Daily PM - Fortress Metal Detector"); technician_name="Jason Riddle"; leader_name="Dave Haney"; step="final_written_warning"; action_date="2026-05-01"; expires_at="2026-11-01"; skip_reason="Second written warning within 6 months for repeated PM non-compliance."; notes=$null; created_by="Dave Haney" }
    @{ finding_id=(Find-Id "Wyatt Talaska" "Daily PM - Matrix Morpheus VFFS"); technician_name="Wyatt Talaska"; leader_name="Dave Haney"; step="coaching"; action_date="2026-04-03"; expires_at=$null; skip_reason=$null; notes=$null; created_by="Dave Haney" }
    @{ finding_id=$null; technician_name="Tristan Chandler"; leader_name="Dave Haney"; step="final_written_warning"; action_date="2026-05-10"; expires_at="2026-11-10"; skip_reason="Unauthorized/extended break - 2nd occurrence per handbook table."; notes=$null; created_by="Dave Haney" }
    @{ finding_id=$null; technician_name="Adam Mccalahan"; leader_name="Dave Haney"; step="termination"; action_date="2026-04-20"; expires_at=$null; skip_reason="Time theft - first occurrence, per handbook skips directly to termination."; notes=$null; created_by="Dave Haney" }

    @{ finding_id=(Find-Id "Angel Mejia" "Daily PM - ZFA Sorter Control"); technician_name="Angel Mejia"; leader_name="Ron Vogel"; step="coaching"; action_date="2026-07-15"; expires_at=$null; skip_reason=$null; notes=$null; created_by="Ron Vogel" }
    @{ finding_id=(Find-Id "Arnie Chavez" "Daily PM - Intelligrated Conveyor"); technician_name="Arnie Chavez"; leader_name="Ron Vogel"; step="written_warning"; action_date="2026-06-07"; expires_at="2026-12-07"; skip_reason=$null; notes=$null; created_by="Ron Vogel" }

    @{ finding_id=(Find-Id "Robert Knudsen" "Daily PM - AutoStore Grid Bay 1"); technician_name="Robert Knudsen"; leader_name="Wilberth Carrizal"; step="coaching"; action_date="2026-07-12"; expires_at=$null; skip_reason=$null; notes=$null; created_by="Wilberth Carrizal" }
    @{ finding_id=(Find-Id "Robert Knudsen" "Weekly PM - Ecolab Wash Station"); technician_name="Robert Knudsen"; leader_name="Wilberth Carrizal"; step="written_warning"; action_date="2026-06-05"; expires_at="2026-12-05"; skip_reason=$null; notes="Second finding within 60 days."; created_by="Wilberth Carrizal" }
    @{ finding_id=(Find-Id "Miguel Pereira Lara" "Daily PM - Cherry-Burrell Pump"); technician_name="Miguel Pereira Lara"; leader_name="Wilberth Carrizal"; step="coaching"; action_date="2026-05-20"; expires_at=$null; skip_reason=$null; notes=$null; created_by="Wilberth Carrizal" }
)

Write-Host "Inserting $($actions.Count) discipline actions..."
$actionsJson = $actions | ConvertTo-Json -Depth 5
$insertedActions = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/discipline_actions" -Method Post -Headers $headers -Body $actionsJson
Write-Host "Inserted $($insertedActions.Count) discipline actions."
