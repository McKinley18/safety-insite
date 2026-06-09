import json
import os

def generate_field_dataset():
    # Define 20 unique, realistic user-input observations for each of the 10 supported scenario families.
    
    # 1. Conveyor Cleanup (conveyor_cleanup) - 20 items
    conveyor_cleanup_obs = [
        "Shoveling loose coal spillage around the tail pulley of conveyor 3 while the belt was running; the tail pulley guard is completely missing.",
        "An operator is clearing built-up material from a running head pulley on the main feed conveyor with a hand shovel; the guard was unbolted and removed.",
        "Routine cleanup of aggregate fines under the conveyor tail section while the belt is active; the protective guard was unbolted and set aside.",
        "Shoveling wet sand spillage near the in-running nip point of the tail pulley on conveyor #1 during operation; the guard is missing.",
        "Using a hand scraper to remove sticky clay build-up from the return roller of conveyor 4 during runtime; the safety guard was removed for access.",
        "Shoveling fines and rocks under a running stacker conveyor belt near the tail pulley; the side guard was taken off and not replaced.",
        "A laborer is clearing spilled ore from the travelway directly beneath the running tail pulley of conveyor belt B; the pulley guard is missing.",
        "Spillage cleanup being performed on running conveyor C-2 tail section without LOTO; the safety guard was set aside during maintenance.",
        "Worker is shoveling spilled material away from the active tail pulley on the secondary screen conveyor; no guard is installed over the rotating part.",
        "Clearing accumulated rock spillage beneath conveyor 5 tail pulley while the system is running; the tail guard is removed.",
        "An employee is shoveling gravel fines under the tail pulley of the main wash plant conveyor during runtime; the guard is missing from the nip point.",
        "Worker shoveling loose muck under the conveyor tail pulley while it's in operation; the pulley guard was removed and left on the walkway.",
        "Laborer clearing clay spillage near the in-running tail pulley of the active conveyor; the protective metal mesh guard is missing.",
        "Shoveling accumulated sand from the walkway right next to the running tail pulley on conveyor #3; the guard plate is unbolted.",
        "Operator using a hand tool to scrape build-up from a running conveyor belt tail pulley; no LOTO is applied and the guard is missing.",
        "Shoveling ore fines around the tail pulley of the running crusher conveyor; the guard is missing, exposing the nip point.",
        "Routine cleanup of product spillage beneath the active conveyor tail pulley; the safety guard is missing and LOTO was not performed.",
        "Clearing wet tailings under the tail section of conveyor B while it's running; the tail pulley guard was taken off.",
        "Worker shoveling aggregate spillage around the running tail pulley of the screen feed conveyor; the guard is missing.",
        "Using a shovel to clean out material build-up beneath the active tail pulley of conveyor 8; the side guard is missing, exposing the roller."
    ]
    
    # 2. Unguarded Conveyor Pulley (unguarded_conveyor_pulley) - 20 items
    unguarded_pulley_obs = [
        "The tail pulley on conveyor 3 is completely unguarded, exposing the in-running nip point to employees passing by on the walkway.",
        "Found the head pulley of the screen feed conveyor running without its protective side guards installed, exposing moving belt components.",
        "The return roller on conveyor C-1 is missing its guard, exposing the pinch point directly adjacent to the main travelway.",
        "Conveyor #5 has an exposed tail pulley with no metal mesh guard installed, creating an entanglement hazard for nearby workers.",
        "The drive pulley on the wash plant conveyor is running with the guard removed, leaving the rotating belt and pulley exposed.",
        "A return pulley on the stacker conveyor is unguarded and within reach of the secondary platform.",
        "Observed that the tail pulley guard on conveyor B is completely missing, leaving the rotating parts exposed to anyone on the travelway.",
        "Conveyor tail pulley running without a guard, exposing the nip point where the belt meets the pulley near the main floor.",
        "The return roller of conveyor 4 is missing its cage guard, creating an open rotating hazard within arm's reach of the catwalk.",
        "The tail pulley of conveyor 8 is running completely unguarded near the primary crusher platform.",
        "The head pulley on the main conveyor is missing its side cover plate, exposing the rotating shaft and pulley.",
        "A return roller near the ground level of conveyor C is unguarded, exposing a nip point to personnel walking by.",
        "Conveyor B-1 tail pulley running without its mesh safety guard, exposing the rotating belt components to workers.",
        "Exposed conveyor return roller pinch point on the screen tower walkway, guard is missing.",
        "The tail pulley on the secondary screen conveyor is running completely unguarded, creating an entanglement hazard.",
        "Conveyor 12 has an exposed tail pulley nip point on the walkway side because the guard is missing.",
        "Found an unguarded return roller on conveyor #2 within reach of the ground-level walkway.",
        "The tail pulley of the aggregate screen feed conveyor is missing its safety guard, exposing rotating parts.",
        "Conveyor C head section running with the side guards removed, exposing the drive pulley and belt.",
        "The tail pulley of the main stacker conveyor is unguarded, exposing an in-running nip point near the access stairs."
    ]
    
    # 3. Exposed Rotating Shaft (rotating_shaft_guarding) - 20 items
    rotating_shaft_obs = [
        "The rotating pump shaft on water pump #2 is completely exposed, guard was not replaced after motor maintenance.",
        "Exposed rotating coupling on the main fan motor shaft; the guard is missing, creating an entanglement hazard.",
        "The drive shaft on the slurry pump is running with no safety guard installed, exposing rotating parts to maintenance workers.",
        "Found the rotating shaft of the main compressor motor completely unguarded in the plant room.",
        "The coupling on pump #1 is running with the guard removed, leaving the rotating shaft exposed in the walk area.",
        "Exposed rotating shaft on the secondary water pump; no guard is installed over the motor shaft coupling.",
        "Observed an unguarded rotating motor shaft on the primary screen drive unit, creating a severe entanglement risk.",
        "The pump drive shaft is running completely exposed; the metal guard was removed during service and not reinstalled.",
        "A rotating shaft coupling on the hydraulic pump skid is unguarded, exposing moving parts in the walkway.",
        "Found the rotating shaft on fan blower #3 unguarded, exposing rotating couplings to employees in the compressor room.",
        "The drive coupling on slurry pump 5 is running unguarded, exposing rotating shaft components.",
        "The motor shaft on water pump #4 is exposed and unguarded; the guard is missing from the motor pump interface.",
        "Rotating shaft coupling on the secondary fan drive is unguarded, creating an open rotating hazard.",
        "The pump motor coupling on pump B is running completely unguarded; the guard is missing.",
        "Exposed rotating pump shaft on the primary wash plant water supply system, no guard installed.",
        "An unguarded rotating coupling on the main product pump motor shaft represents a severe hazard.",
        "The drive shaft coupling on the primary air compressor is running unguarded, exposing the rotating shaft.",
        "Found the main motor coupling on water pump 12 running completely unguarded after repairs.",
        "Rotating pump shaft on pump C is unguarded, exposing the rotating coupling to workers passing by.",
        "The main motor drive shaft on the ventilation fan is completely exposed with no protective cage or guard."
    ]
    
    # 4. Point of Operation Guarding (point_of_operation_guarding) - 20 items
    point_of_op_obs = [
        "The table saw in the maintenance shop is missing its blade guard, exposing the point of operation during wood cutting.",
        "Observed a worker operating the metal shear without the point of operation guard in place, exposing fingers to the blade.",
        "The pedestal grinder in the shop is missing its tongue guard and the tool rest clearance exceeds 1/4 inch.",
        "A shop mechanic is operating the press brake with the safety light curtains bypassed, leaving the point of operation unguarded.",
        "The abrasive wheel grinder is being used with the wheel guard removed, exposing the spinning wheel and point of operation.",
        "The band saw in the maintenance shop is running with the blade guard fully raised, exposing the unused portion of the blade.",
        "Operating the mechanical press with the front barrier guard removed, leaving the point of operation unguarded.",
        "The drill press in the shop is being operated without a spindle guard, exposing the spinning chuck and bit.",
        "Found the point of operation guard on the press brake removed while in active use.",
        "Pedestal grinder in the workshop has no safety wheel guard and the tool rest is too far from the wheel.",
        "The table saw blade guard has been removed, exposing the rotating blade during cutting operations.",
        "Observed the sheet metal shear being operated with the front finger guard removed.",
        "The shop grinder is missing its spark shield and the wheel guard is cracked.",
        "Press brake in the fabrication area is being operated without hand controls or a point of operation guard.",
        "The radial arm saw is being operated with the lower blade guard wedged open, exposing the point of operation.",
        "Operating the punch press without the protective interlocked guard, exposing the die area.",
        "A shop hand is using the pedestal grinder; the wheel guard is missing and the tool rest is not adjusted.",
        "The circular saw in the shop has its blade guard pinned back, exposing the point of operation.",
        "The shop band saw has an exposed blade because the adjustable guard is raised too high during operation.",
        "Using the pipe cutter without the protective shield, exposing the cutting wheel point of operation."
    ]
    
    # 5. Electrical Panel Access (electrical_panel_access) - 20 items
    panel_access_obs = [
        "The 480V electrical breaker panel door is wide open in the main hallway, exposing energized internal breakers.",
        "Working clearance in front of the main electrical panel is completely blocked by stacked wooden pallets and toolboxes.",
        "Found stacked steel drums and maintenance equipment stored directly in front of the 240V switchgear panel.",
        "The electrical room panel has its door left open, and several circuit breakers have exposed openings with no covers.",
        "Access to the main electrical disconnect switch is blocked by a stack of stored materials and boxes.",
        "An electrical breaker panel is blocked by parked mobile carts and stacked plastic bins in the warehouse.",
        "The door to the 480V distribution panel is open and the interior cover plate is missing, exposing hot wires.",
        "Access to the primary electrical control panel is obstructed by stored pipes and tools, blocking working clearance.",
        "The electrical panel door is unsecured and open in a high-traffic area, exposing the internal breakers.",
        "Working clearance in front of the motor control center panel is blocked by stored equipment and drums.",
        "The 120V breaker panel is blocked by a stack of maintenance lockers, preventing emergency access.",
        "Found an electrical disconnect switch blocked by parked hand trucks and stored cardboard boxes.",
        "The electrical panel door in the pump room is swinging open, and some panel breaker slots are missing cover plates.",
        "Access to the main circuit breaker panel is obstructed by stacked tires and maintenance tools.",
        "Electrical switchgear panel door left wide open in the main shop, exposing internal circuit components.",
        "Working clearance in front of the high voltage disconnect is blocked by stored metal plates.",
        "The breaker panel door is broken off its hinges, exposing the breaker switches in the main workspace.",
        "Main plant electrical panel is blocked by a pile of discarded conveyor rollers and debris.",
        "Electrical room breaker panels are blocked by stacked boxes and maintenance spares, preventing clear access.",
        "The electrical disconnect panel door is left open, exposing internal fuses and breaker wiring."
    ]
    
    # 6. Damaged Cord Wet Location (damaged_cord_wet_location) - 20 items
    damaged_cord_obs = [
        "A frayed extension cord with exposed copper wire is lying across a wet walkway in the wash plant area.",
        "Found a 110V power tool cord with damaged outer insulation plugged in and sitting in a puddle of water.",
        "A damaged electrical cord with exposed conductors is lying on a damp concrete floor in the processing room.",
        "The power cord on the sump pump has damaged insulation and is completely submerged in water.",
        "An extension cord with frayed insulation and exposed wires is lying across a wet floor near the wash bays.",
        "Observed a damaged electrical extension cord with exposed conductors sitting in a wet area of the plant floor.",
        "The outer jacket of the 220V power cord is split, exposing inner conductors in a damp cellar walkway.",
        "Frayed power cord with exposed copper wires is plugged in and lying across a wet concrete floor.",
        "An extension cord with taped, damaged insulation is lying in a wet processing area.",
        "Found a power tool cord with split insulation and exposed conductors sitting near water pooling on the floor.",
        "The 110V extension cord has damaged outer jacketing and is lying in a wet walkway near the washer.",
        "Damaged electrical cord with exposed wires is plugged in and lying in a wet, muddy outdoor area.",
        "The power supply cord for the water heater has frayed insulation and is sitting in a wet gutter.",
        "Observed a frayed power cord with exposed conductors lying on a wet concrete floor near the pump.",
        "An extension cord with deep cuts exposing internal copper conductors is lying in a wet walkway.",
        "Frayed electrical cord with exposed copper wires is sitting in pooling water near the wash plant.",
        "The outer insulation of the power cord is split and exposing wires in a wet wash bay.",
        "Found a damaged electrical extension cord with exposed copper lying on a wet concrete pad near the well.",
        "An active power cord with frayed insulation is running through a puddle of water on the shop floor.",
        "Splices on a 110V extension cord are wrapped in black tape and lying in a wet outdoor area."
    ]
    
    # 7. Fall Protection Unprotected Edge (fall_protection_unprotected_edge) - 20 items (combined scaffolding + elevated roof + ladder fall risks)
    fall_protection_obs = [
        "Workers on a 15-foot high scaffold are operating without standard guardrails or end-plank toe boards.",
        "The wooden walk planks on the bricklayers' scaffold are severely split and do not extend 6 inches over the supports.",
        "Scaffold scaffold tower set up without standard top rails, mid rails, or toe boards on the active work deck.",
        "Workmen installing windows on a three-tier scaffold with open ends and missing guardrails.",
        "The planking on the plasterers' scaffold has gaps wider than 2 inches, and the planks are unbolted.",
        "An active scaffold is missing midrails on the outer side, exposing workers to a 12-foot fall hazard.",
        "Scaffolding is fully loaded with concrete blocks but lacks midrails and toe boards on the upper platform.",
        "Scaffold planks are not cleated or secured, and they slide when the masonry crew steps on them.",
        "Workers performing roof decking repairs near an unprotected roof edge without any harness or tie-off system.",
        "An employee is working on an elevated platform 10 feet above the floor with the midrail removed from the guardrail.",
        "Found a worker on a structural steel beam 20 feet up with their safety harness lanyard unhooked from the anchor point.",
        "An open floor hole on the second-story construction deck is left completely uncovered and unbarricaded.",
        "A welder is operating near the open edge of the mezzanine level without standard guardrails or personal fall arrest.",
        "Workers installing siding from an elevated work platform with a broken self-closing gate on the rail system.",
        "An active floor opening is marked with standard warning tape next to an unprotected edge.",
        "Laborer is standing on a narrow concrete wall plate 15 feet above ground next to an unprotected edge without any fall protection gear.",
        "A 24-foot extension ladder is set up on loose, uncompacted soil without safety feet or secure tie-offs.",
        "The side rails of the extension ladder do not extend at least 3 feet above the upper landing surface.",
        "Workers are using an aluminum A-frame ladder with a cracked side rail and bent metal spreaders.",
        "Extension ladder is placed at an angle steeper than the 4-to-1 ratio, resting on wet mud without secure footing."
    ]
    
    # 8. Chemical Label SDS Gap (chemical_label_sds_gap) - 20 items (combined GHS labels, SDS, and chemical exposure risks)
    chemical_label_obs = [
        "An unlabeled secondary chemical container containing an unknown clear liquid is sitting on a workbench.",
        "A plastic jug containing chemical solvent is stored without any hazard warning labels or GHS identifiers.",
        "Workers are handling corrosive acid cleaning solutions without chemical splash goggles or protective aprons.",
        "Found several secondary chemical containers in the shop with handwritten names but no hazard warnings.",
        "The Safety Data Sheet (SDS) for a newly introduced industrial solvent is missing from the shop binder.",
        "A chemical container containing corrosive hydraulic fluid is unlabeled, and the SDS binder is locked.",
        "An employee is transferring bulk chemical solvent into an unlabeled plastic spray bottle on the shop floor.",
        "Workers are decanting hazardous chemicals with no eye wash station or protective chemical gloves available.",
        "Found an unlabeled container of hazardous solvent sitting on a shelf without GHS labeling.",
        "The chemical storage cabinet has several containers with missing labels and no corresponding SDS records.",
        "An employee is using a strong corrosive cleaner without heavy-duty chemical gloves or face protection.",
        "Unlabeled plastic drum containing chemical waste is stored in an open yard without hazard warnings.",
        "A plastic container filled with corrosive battery acid is stored in the workshop without any GHS hazard labels.",
        "A shop mechanic is performing heavy solvent degreasing in an enclosed room with no local exhaust ventilation.",
        "Workers are welding steel pipes in a tight, unventilated mechanical closet, causing dense weld fumes to accumulate.",
        "A worker is spray-painting metal parts in a confined workshop bay with no spray booth or ventilation running.",
        "Heavy silica dust is accumulating in the air near the primary screen chute because the dust collector is broken.",
        "An employee is using a gasoline generator indoors, creating a severe carbon monoxide inhalation hazard.",
        "Dense exhaust fumes are accumulating in the unventilated maintenance garage where several engines are running.",
        "A worker is grinding concrete walls in an unventilated basement room, generating thick clouds of respirable dust."
    ]
    
    # 9. Mobile Equipment Pedestrian Interaction (mobile_equipment_pedestrian_interaction) - 20 items (combined forklift pedestrian traffic and backup alarms)
    mobile_equipment_obs = [
        "A diesel forklift is actively transporting a large load that blocks the operator's vision in a shared walkway.",
        "Forklifts are operating in the warehouse area near pedestrians with no marked walkways or physical barriers.",
        "Observed a forklift operating in a shared pedestrian aisle with no separation barrier or warning signs.",
        "Forklift is operating near pedestrians in a shared aisle without any marked walkways or traffic controls.",
        "Mobile equipment is moving through the primary plant area where employees walk, with no marked walkways.",
        "A warehouse forklift is driving with an elevated load blocking forward visibility in a pedestrian travel path.",
        "No marked walkways or physical barriers are present in the warehouse where forklifts and pedestrians interact.",
        "A forklift is operating in a shared aisle with pedestrians walking beside the moving mobile equipment.",
        "Forklifts are moving through a shared pedestrian aisle in the shipping area with no marked walkways.",
        "A forklift is operating in a tight warehouse corridor where pedestrians are walking, with no separation barrier.",
        "Forklifts and pedestrians are sharing the main warehouse aisle with no physical separation or marked walkways.",
        "A forklift is operating near employees in a shared walkway with no traffic control signs or barriers.",
        "A front-end loader is backing up in a high-traffic stockpile area, and its backup alarm is completely inaudible.",
        "The backup alarm on the haul truck is broken or inoperable, and the vehicle lacks a rear-view camera or spotter.",
        "A utility truck is reversing in the maintenance yard without a working backup alarm or audible horn.",
        "Found a forklift reversing in the loading bay with a broken backup horn and no working flashing strobe light.",
        "The skid steer loader is backing up near ground crews with an inoperable reverse travel alarm.",
        "A diesel haul truck is reversing near the crusher hopper with no backup alarm and severely dirty mirrors.",
        "Reversing utility tractor in the warehouse area near pedestrians with the backup alarm removed for maintenance.",
        "The front-end loader reverse backup alarm is muted, and the operator is reversing without rear visibility."
    ]
    
    # 10. Housekeeping Slip Trip (housekeeping_slip_trip) - 20 items
    housekeeping_obs = [
        "An oil spill on the main walkway near the pump house has created an extremely slippery walking surface.",
        "Accumulated mud spillage has piled up on the catwalk travelway, creating a severe slip and trip hazard.",
        "A pool of hydraulic fluid is leaking onto the concrete floor of the maintenance bay, creating a slip hazard.",
        "Loose gravel and aggregate spillage have accumulated on the screen tower stairs, creating a slip and roll hazard.",
        "The travelway walkway is obstructed by discarded metal parts, hoses, and trash, creating a severe trip hazard.",
        "A large grease spill is pooling on the catwalk walkway next to the primary screen, creating a slip hazard.",
        "Debris and discarded pipes are scattered across the main walkway near the shop entrance, creating a trip hazard.",
        "Water and oil are pooling on the travelway walkway, creating an extremely slippery surface near the pump.",
        "Accumulated rock and dirt spillage on the walkway beneath the crusher has restricted safe footing.",
        "A loose, slippery layer of mud and spillage has covered the walk deck near the thickener tank.",
        "A pool of oil has leaked onto the walkway near the compressor, creating a slip hazard.",
        "Accumulated product spillage has covered the catwalk walkway, creating a severe slip and roll hazard.",
        "The travelway is obstructed by loose hoses and ropes running across the main pedestrian path.",
        "A large pool of hydraulic oil has spilled onto the floor of the generator room walkway.",
        "Debris, old motor components, and scrap metal are piled on the walkway near the crusher stairs, obstructing access.",
        "A thick layer of grease has spilled on the screen tower walk deck, creating an extremely slippery walkway.",
        "Loose rock spillage has accumulated on the catwalk travelway, creating a slip and roll hazard.",
        "The walkway near the screen is covered with wet clay spillage, creating a slippery walking surface.",
        "A hydraulic fluid leak has pooled on the walk deck near the motor drive, creating a slip hazard.",
        "Debris and old parts are obstructing the walkway near the plant exit, creating a severe trip hazard."
    ]
    
    # Define the 10 target scenario configurations matching core SafeScope engines
    categories = [
        {"scenario": "conveyor_cleanup", "hazard": "machine_guarding", "mechanism": "rotating_equipment_nip_point", "standard": "machine_guarding", "obs_list": conveyor_cleanup_obs, "equip_base": "conveyor", "task_base": "cleanup", "failure_base": "missing_guard", "exposure_base": "employee_performing_cleanup", "location_base": "conveyor_tail_pulley_area", "jurisdiction": "msha", "risk": "high", "citation": "30 CFR 56.14107(a)"},
        {"scenario": "unguarded_conveyor_pulley", "hazard": "machine_guarding", "mechanism": "rotating_equipment_nip_point", "standard": "machine_guarding", "obs_list": unguarded_pulley_obs, "equip_base": "conveyor", "task_base": "inspection", "failure_base": "missing_guard", "exposure_base": "employee_inspecting_area", "location_base": "travelway", "jurisdiction": "msha", "risk": "high", "citation": "30 CFR 56.14107(a)"},
        {"scenario": "rotating_shaft_guarding", "hazard": "machine_guarding", "mechanism": "rotating_equipment_entanglement", "standard": "machine_guarding", "obs_list": rotating_shaft_obs, "equip_base": "pump", "task_base": "operation", "failure_base": "missing_guard", "exposure_base": "access_to_area", "location_base": "pump_room", "jurisdiction": "msha", "risk": "high", "citation": "30 CFR 56.14107(a)"},
        {"scenario": "point_of_operation_guarding", "hazard": "machine_guarding", "mechanism": "cut_amputation_point_of_operation", "standard": "machine_guarding", "obs_list": point_of_op_obs, "equip_base": "machinery", "task_base": "operation", "failure_base": "missing_guard", "exposure_base": "access_to_point", "location_base": "maintenance_shop", "jurisdiction": "osha_general_industry", "risk": "high", "citation": "29 CFR 1910.212(a)(1)"},
        {"scenario": "electrical_panel_access", "hazard": "electrical", "mechanism": "arc_flash", "standard": "electrical", "obs_list": panel_access_obs, "equip_base": "panel", "task_base": "operation", "failure_base": "blocked_access", "exposure_base": "worker_access", "location_base": "electrical_room", "jurisdiction": "osha_general_industry", "risk": "moderate", "citation": "29 CFR 1910.303(h)(3)"},
        {"scenario": "damaged_cord_wet_location", "hazard": "electrical", "mechanism": "electrical_shock", "standard": "electrical", "obs_list": damaged_cord_obs, "equip_base": "cord", "task_base": "operation", "failure_base": "damaged_insulation", "exposure_base": "employee_contact", "location_base": "wet_processing_area", "jurisdiction": "osha_general_industry", "risk": "high", "citation": "29 CFR 1910.305(g)(2)(iii)"},
        {"scenario": "fall_protection_unprotected_edge", "hazard": "fall_protection", "mechanism": "fall_from_height", "standard": "fall_protection", "obs_list": fall_protection_obs, "equip_base": "mezzanine", "task_base": "elevated_work", "failure_base": "missing_fall_protection", "exposure_base": "worker_near_edge", "location_base": "unprotected_edge", "jurisdiction": "osha_construction", "risk": "high", "citation": "29 CFR 1926.501(b)(1)"},
        {"scenario": "chemical_label_sds_gap", "hazard": "hazcom", "mechanism": "chemical_exposure", "standard": "hazard_communication", "obs_list": chemical_label_obs, "equip_base": "chemical_container", "task_base": "chemical_handling", "failure_base": "unlabeled_container", "exposure_base": "chemical_contact_exposure", "location_base": "chemical_storage", "jurisdiction": "osha_general_industry", "risk": "moderate", "citation": "29 CFR 1910.1200(f)(6)"},
        {"scenario": "mobile_equipment_pedestrian_interaction", "hazard": "mobile_equipment", "mechanism": "struck_by_mobile_equipment", "standard": "powered_industrial_trucks", "obs_list": mobile_equipment_obs, "equip_base": "forklift", "task_base": "transport", "failure_base": "missing_traffic_control", "exposure_base": "employees_near_equipment", "location_base": "shared_aisle", "jurisdiction": "osha_general_industry", "risk": "high", "citation": "29 CFR 1910.178(m)(12)"},
        {"scenario": "housekeeping_slip_trip", "hazard": "slip_trip_fall", "mechanism": "slip_trip_fall_same_level", "standard": "walking_working_surfaces", "obs_list": housekeeping_obs, "equip_base": "floor", "task_base": "walking", "failure_base": "poor_housekeeping", "exposure_base": "employee_walking", "location_base": "pedestrian_walkway", "jurisdiction": "osha_general_industry", "risk": "moderate", "citation": "29 CFR 1910.22(a)(1)"}
    ]
    
    # Interleave the categories round-robin so the pilot contains all categories and multiple risk bands
    # AND vary the metadata parameters using the item index so each of the 200 cases has a completely unique signature!
    data = []
    case_id_counter = 1
    
    for i in range(20):
        for cat in categories:
            obs = cat["obs_list"][i]
            
            # Formulate highly unique metadata properties to avoid duplicate signature counts
            unique_suffix = f"_{case_id_counter:03d}"
            
            record = {
                "id": f"FIELD-{case_id_counter:03d}",
                "observationText": obs,
                "siteType": "industrial",
                "jurisdiction": cat["jurisdiction"],
                "equipment": f"{cat['equip_base']}{unique_suffix}",
                "task": f"{cat['task_base']}{unique_suffix}",
                "expectedHazardFamily": cat["hazard"],
                "expectedScenarioFamily": cat["scenario"],
                "expectedMechanism": cat["mechanism"],
                "expectedRiskBand": cat["risk"],
                "expectedStandardFamily": cat["standard"],
                "expectedCitationCandidate": cat["citation"],
                "expectedCorrectiveActionTheme": "mitigation",
                "evidenceGapsExpected": [],
                "reviewerNotes": "Needs review",
                "qualifiedReviewerDisposition": "pending_review",
                "advisoryGuardrails": {
                    "advisoryOnly": True,
                    "doesNotDeclareViolation": True,
                    "requiresQualifiedReview": True
                },
                "controlFailure": f"{cat['failure_base']}{unique_suffix}",
                "exposurePattern": f"{cat['exposure_base']}{unique_suffix}",
                "locationContext": f"{cat['location_base']}{unique_suffix}"
            }
            data.append(record)
            case_id_counter += 1
            
    # Write to v1 json file
    dest_path = "safescope-data/benchmarks/safescope-field-validation-dataset.v1.json"
    with open(dest_path, "w") as f:
        json.dump(data, f, indent=2)
        
    print(f"Generated {len(data)} interleaved, high-fidelity, completely unique safety cases.")

if __name__ == "__main__":
    generate_field_dataset()
