import os
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from dotenv import load_dotenv
from sqlalchemy import create_engine, text


# ------------------------------------------------------------
# Load environment
# ------------------------------------------------------------

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in .env")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)


# ------------------------------------------------------------
# Deterministic UUID helper
# ------------------------------------------------------------

def uid(name: str) -> str:
    """
    Generate the same UUID every time for the same name.
    This makes the seed script safe to run again.
    """
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"khanan-mitra:{name}"))


# ------------------------------------------------------------
# Demo data
# ------------------------------------------------------------

VTC_DATA = [
    {
        "id": uid("vtc-ranchi"),
        "name": "Ranchi Mining Vocational Training Centre",
        "district": "Ranchi",
        "sector": "coal",
        "latitude": 23.3441,
        "longitude": 85.3096,
    },
    {
        "id": uid("vtc-dhanbad"),
        "name": "Dhanbad Industrial Safety Training Centre",
        "district": "Dhanbad",
        "sector": "coal",
        "latitude": 23.7957,
        "longitude": 86.4304,
    },
    {
        "id": uid("vtc-east-singhbhum"),
        "name": "East Singhbhum Steel Safety Training Centre",
        "district": "East Singhbhum",
        "sector": "steel",
        "latitude": 22.8046,
        "longitude": 86.2029,
    },
    {
        "id": uid("vtc-koderma"),
        "name": "Koderma Mica Vocational Training Centre",
        "district": "Koderma",
        "sector": "mica",
        "latitude": 24.4676,
        "longitude": 85.5939,
    },
]


WORKERS = [
    {
        "id": uid("worker-1001"),
        "vtc": "vtc-ranchi",
        "short_id": "K101",
        "name": "Arjun Kumar",
        "phone": "9000001001",
        "department": "Mine Operations",
        "contractor": "Jharkhand Mining Services",
        "blood_group": "B+",
        "language": "hi",
    },
    {
        "id": uid("worker-1002"),
        "vtc": "vtc-ranchi",
        "short_id": "K102",
        "name": "Ramesh Oraon",
        "phone": "9000001002",
        "department": "Safety Operations",
        "contractor": "Eastern Industrial Works",
        "blood_group": "O+",
        "language": "hi",
    },
    {
        "id": uid("worker-1003"),
        "vtc": "vtc-ranchi",
        "short_id": "K103",
        "name": "Suresh Tirkey",
        "phone": "9000001003",
        "department": "Electrical",
        "contractor": "Jharkhand Mining Services",
        "blood_group": "A+",
        "language": "sat",
    },
    {
        "id": uid("worker-1004"),
        "vtc": "vtc-dhanbad",
        "short_id": "K104",
        "name": "Manoj Kumar",
        "phone": "9000001004",
        "department": "Mine Operations",
        "contractor": "Dhanbad Coal Contractors",
        "blood_group": "B+",
        "language": "hi",
    },
    {
        "id": uid("worker-1005"),
        "vtc": "vtc-dhanbad",
        "short_id": "K105",
        "name": "Birsa Murmu",
        "phone": "9000001005",
        "department": "Ventilation",
        "contractor": "Eastern Industrial Works",
        "blood_group": "O-",
        "language": "sat",
    },
    {
        "id": uid("worker-1006"),
        "vtc": "vtc-dhanbad",
        "short_id": "K106",
        "name": "Deepak Singh",
        "phone": "9000001006",
        "department": "Mechanical",
        "contractor": "Dhanbad Coal Contractors",
        "blood_group": "A+",
        "language": "hi",
    },
    {
        "id": uid("worker-1007"),
        "vtc": "vtc-east-singhbhum",
        "short_id": "K107",
        "name": "Vikash Mahato",
        "phone": "9000001007",
        "department": "Steel Production",
        "contractor": "Tata Industrial Services",
        "blood_group": "B+",
        "language": "hi",
    },
    {
        "id": uid("worker-1008"),
        "vtc": "vtc-east-singhbhum",
        "short_id": "K108",
        "name": "Ajay Kumar",
        "phone": "9000001008",
        "department": "Furnace Operations",
        "contractor": "Eastern Steel Contractors",
        "blood_group": "AB+",
        "language": "hi",
    },
    {
        "id": uid("worker-1009"),
        "vtc": "vtc-east-singhbhum",
        "short_id": "K109",
        "name": "Lakhan Hansda",
        "phone": "9000001009",
        "department": "Safety Operations",
        "contractor": "Tata Industrial Services",
        "blood_group": "O+",
        "language": "sat",
    },
    {
        "id": uid("worker-1010"),
        "vtc": "vtc-koderma",
        "short_id": "K110",
        "name": "Rajesh Yadav",
        "phone": "9000001010",
        "department": "Mica Processing",
        "contractor": "Koderma Minerals",
        "blood_group": "A+",
        "language": "hi",
    },
    {
        "id": uid("worker-1011"),
        "vtc": "vtc-koderma",
        "short_id": "K111",
        "name": "Somra Soren",
        "phone": "9000001011",
        "department": "Processing Unit",
        "contractor": "Koderma Minerals",
        "blood_group": "B+",
        "language": "sat",
    },
    {
        "id": uid("worker-1012"),
        "vtc": "vtc-koderma",
        "short_id": "K112",
        "name": "Pankaj Kumar",
        "phone": "9000001012",
        "department": "Maintenance",
        "contractor": "Eastern Industrial Works",
        "blood_group": "O+",
        "language": "hi",
    },
]


# ------------------------------------------------------------
# Main seed operation
# ------------------------------------------------------------

def seed_database():
    print("Connecting to Neon PostgreSQL...")

    with engine.begin() as conn:

        # ----------------------------------------------------
        # 1. VTCs
        # ----------------------------------------------------

        print("Seeding VTCs...")

        for vtc in VTC_DATA:
            conn.execute(
                text(
                    """
                    INSERT INTO vtc (
                        id,
                        name,
                        district,
                        state,
                        sector,
                        latitude,
                        longitude
                    )
                    VALUES (
                        :id,
                        :name,
                        :district,
                        'Jharkhand',
                        :sector,
                        :latitude,
                        :longitude
                    )
                    ON CONFLICT (id) DO NOTHING
                    """
                ),
                vtc,
            )

        # ----------------------------------------------------
        # 2. Workers
        # ----------------------------------------------------

        print("Seeding workers...")

        vtc_ids = {
            key: uid(key)
            for key in [
                "vtc-ranchi",
                "vtc-dhanbad",
                "vtc-east-singhbhum",
                "vtc-koderma",
            ]
        }

        for worker in WORKERS:
            conn.execute(
                text(
                    """
                    INSERT INTO worker (
                        id,
                        vtc_id,
                        short_worker_id,
                        full_name,
                        phone_number,
                        department,
                        contractor,
                        blood_group,
                        preferred_language,
                        is_active,
                        badge_issued_at
                    )
                    VALUES (
                        :id,
                        :vtc_id,
                        :short_worker_id,
                        :full_name,
                        :phone_number,
                        :department,
                        :contractor,
                        :blood_group,
                        :preferred_language,
                        true,
                        :badge_issued_at
                    )
                    ON CONFLICT (id) DO NOTHING
                    """
                ),
                {
                    "id": worker["id"],
                    "vtc_id": vtc_ids[worker["vtc"]],
                    "short_worker_id": worker["short_id"],
                    "full_name": worker["name"],
                    "phone_number": worker["phone"],
                    "department": worker["department"],
                    "contractor": worker["contractor"],
                    "blood_group": worker["blood_group"],
                    "preferred_language": worker["language"],
                    "badge_issued_at": datetime.now(timezone.utc),
                },
            )

        # ----------------------------------------------------
        # 3. Get training scenario IDs
        # ----------------------------------------------------

        print("Checking training scenarios...")

        scenario_rows = conn.execute(
            text(
                """
                SELECT id, scenario_key
                FROM training_scenario
                WHERE scenario_key IN (
                    'fire_response_v1',
                    'gas_leak_v1'
                )
                """
            )
        ).fetchall()

        scenarios = {
            row.scenario_key: str(row.id)
            for row in scenario_rows
        }

        if "fire_response_v1" not in scenarios:
            raise RuntimeError(
                "fire_response_v1 was not found. "
                "Run init_schema.sql first."
            )

        if "gas_leak_v1" not in scenarios:
            raise RuntimeError(
                "gas_leak_v1 was not found. "
                "Run init_schema.sql first."
            )

        # ----------------------------------------------------
        # 4. Devices
        # ----------------------------------------------------

        print("Seeding devices...")

        device_data = [
            (
                "device-ranchi-01",
                "vtc-ranchi",
                "AR Device - Ranchi 01",
                "KM-ANDROID-R01",
                "2.1.0",
            ),
            (
                "device-ranchi-02",
                "vtc-ranchi",
                "AR Device - Ranchi 02",
                "KM-ANDROID-R02",
                "2.1.0",
            ),
            (
                "device-dhanbad-01",
                "vtc-dhanbad",
                "AR Device - Dhanbad 01",
                "KM-ANDROID-D01",
                "2.1.0",
            ),
            (
                "device-steel-01",
                "vtc-east-singhbhum",
                "AR Device - Steel 01",
                "KM-ANDROID-S01",
                "2.1.0",
            ),
            (
                "device-koderma-01",
                "vtc-koderma",
                "AR Device - Koderma 01",
                "KM-ANDROID-K01",
                "2.1.0",
            ),
        ]

        for device_key, vtc_key, label, android_id, version in device_data:
            conn.execute(
                text(
                    """
                    INSERT INTO device (
                        id,
                        vtc_id,
                        device_label,
                        android_id,
                        last_synced_at,
                        last_heartbeat_at,
                        pending_records,
                        app_version,
                        encryption_key_version
                    )
                    VALUES (
                        :id,
                        :vtc_id,
                        :device_label,
                        :android_id,
                        :last_synced_at,
                        :last_heartbeat_at,
                        :pending_records,
                        :app_version,
                        1
                    )
                    ON CONFLICT (id) DO NOTHING
                    """
                ),
                {
                    "id": uid(device_key),
                    "vtc_id": vtc_ids[vtc_key],
                    "device_label": label,
                    "android_id": android_id,
                    "last_synced_at": datetime.now(timezone.utc)
                    - timedelta(hours=2),
                    "last_heartbeat_at": datetime.now(timezone.utc)
                    - timedelta(minutes=10),
                    "pending_records": 0,
                    "app_version": version,
                },
            )

        # ----------------------------------------------------
        # 5. Admin user
        # ----------------------------------------------------

        print("Seeding demo admin user...")

        password = "Demo@123"
        password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        admin_id = uid("admin-super")

        conn.execute(
            text(
                """
                INSERT INTO admin_user (
                    id,
                    email,
                    password_hash,
                    full_name,
                    role,
                    vtc_id,
                    is_active
                )
                VALUES (
                    :id,
                    :email,
                    :password_hash,
                    :full_name,
                    'super_admin',
                    NULL,
                    true
                )
                ON CONFLICT (id) DO NOTHING
                """
            ),
            {
                "id": admin_id,
                "email": "admin@khananmitra.demo",
                "password_hash": password_hash,
                "full_name": "Khanan Mitra Administrator",
            },
        )

        # ----------------------------------------------------
        # 6. Completion records
        # ----------------------------------------------------

        print("Seeding completion records...")

        now = datetime.now(timezone.utc)

        completion_data = [
            # Worker 1001 - Fire - passed
            ("completion-1001-fire", "worker-1001", "fire_response_v1",
             0.92, True, 1, 186, 15),

            # Worker 1002 - Fire - passed
            ("completion-1002-fire", "worker-1002", "fire_response_v1",
             0.83, True, 1, 211, 20),

            # Worker 1003 - Gas - passed
            ("completion-1003-gas", "worker-1003", "gas_leak_v1",
             0.88, True, 1, 174, 12),

            # Worker 1004 - Fire - failed
            ("completion-1004-fire", "worker-1004", "fire_response_v1",
             0.58, False, 2, 289, 35),

            # Worker 1005 - Gas - passed
            ("completion-1005-gas", "worker-1005", "gas_leak_v1",
             0.94, True, 1, 163, 9),

            # Worker 1006 - Fire - passed
            ("completion-1006-fire", "worker-1006", "fire_response_v1",
             0.76, True, 1, 230, 24),

            # Worker 1007 - Fire - passed
            ("completion-1007-fire", "worker-1007", "fire_response_v1",
             0.97, True, 1, 155, 8),

            # Worker 1008 - Gas - failed
            ("completion-1008-gas", "worker-1008", "gas_leak_v1",
             0.62, False, 1, 248, 31),

            # Worker 1009 - Gas - passed
            ("completion-1009-gas", "worker-1009", "gas_leak_v1",
             0.81, True, 1, 195, 17),

            # Worker 1010 - Fire - passed
            ("completion-1010-fire", "worker-1010", "fire_response_v1",
             0.89, True, 1, 178, 13),

            # Worker 1011 - Gas - passed
            ("completion-1011-gas", "worker-1011", "gas_leak_v1",
             0.73, True, 1, 222, 26),

            # Worker 1012 - Fire - passed, certificate near expiry
            ("completion-1012-fire", "worker-1012", "fire_response_v1",
             0.79, True, 1, 205, 19),
        ]

        completion_ids = {}

        for (
            completion_key,
            worker_key,
            scenario_key,
            score,
            passed,
            attempts,
            duration,
            days_ago,
        ) in completion_data:

            completion_id = uid(completion_key)
            completion_ids[completion_key] = completion_id

            completed_at = now - timedelta(days=days_ago)

            certificate_expires = (
                completed_at + timedelta(days=90)
                if passed
                else None
            )

            conn.execute(
                text(
                    """
                    INSERT INTO completion_log (
                        id,
                        worker_id,
                        scenario_id,
                        device_android_id,
                        score,
                        passed,
                        total_attempts,
                        duration_seconds,
                        completed_at,
                        verified_at,
                        sync_path,
                        certificate_issued,
                        certificate_jwt,
                        certificate_issued_at,
                        certificate_expires_at,
                        is_flagged,
                        flagged_reason
                    )
                    VALUES (
                        :id,
                        :worker_id,
                        :scenario_id,
                        :device_android_id,
                        :score,
                        :passed,
                        :total_attempts,
                        :duration_seconds,
                        :completed_at,
                        :verified_at,
                        :sync_path,
                        :certificate_issued,
                        :certificate_jwt,
                        :certificate_issued_at,
                        :certificate_expires_at,
                        :is_flagged,
                        :flagged_reason
                    )
                    ON CONFLICT (id) DO NOTHING
                    """
                ),
                {
                    "id": completion_id,
                    "worker_id": uid(worker_key),
                    "scenario_id": scenarios[scenario_key],
                    "device_android_id": "KM-DEMO-DEVICE",
                    "score": score,
                    "passed": passed,
                    "total_attempts": attempts,
                    "duration_seconds": duration,
                    "completed_at": completed_at,
                    "verified_at": completed_at + timedelta(minutes=3),
                    "sync_path": "internet",
                    "certificate_issued": passed,
                    "certificate_jwt": (
                        f"DEMO-CERT-{completion_key}"
                        if passed
                        else None
                    ),
                    "certificate_issued_at": (
                        completed_at + timedelta(minutes=3)
                        if passed
                        else None
                    ),
                    "certificate_expires_at": certificate_expires,
                    "is_flagged": not passed,
                    "flagged_reason": (
                        "Assessment score below passing threshold"
                        if not passed
                        else None
                    ),
                },
            )

        # ----------------------------------------------------
        # 7. Step logs
        # ----------------------------------------------------

        print("Seeding step-level analytics...")

        for (
            completion_key,
            worker_key,
            scenario_key,
            score,
            passed,
            attempts,
            duration,
            days_ago,
        ) in completion_data:

            completion_id = completion_ids[completion_key]

            if scenario_key == "fire_response_v1":
                step_keys = [
                    "identify_exit",
                    "raise_alarm",
                    "select_extinguisher",
                    "use_extinguisher",
                    "evacuate",
                    "report_incident",
                ]
            else:
                step_keys = [
                    "identify_gas_hazard",
                    "select_ppe",
                    "isolate_area",
                    "buddy_system",
                    "report_incident",
                ]

            base_score = score

            for index, step_key in enumerate(step_keys):

                # Make some steps intentionally harder
                if step_key in (
                    "select_extinguisher",
                    "use_extinguisher",
                    "select_ppe",
                ):
                    correct = base_score >= 0.70
                else:
                    correct = base_score >= 0.60

                # A few failed assessments have additional mistakes
                if not passed and index in (2, 3):
                    correct = False

                points = 10 if correct else 0

                conn.execute(
                    text(
                        """
                        INSERT INTO step_log (
                            id,
                            completion_log_id,
                            worker_id,
                            scenario_id,
                            step_key,
                            step_index,
                            action_taken,
                            correct,
                            points_awarded,
                            time_taken_seconds,
                            attempt_number,
                            recorded_at
                        )
                        VALUES (
                            :id,
                            :completion_log_id,
                            :worker_id,
                            :scenario_id,
                            :step_key,
                            :step_index,
                            :action_taken,
                            :correct,
                            :points_awarded,
                            :time_taken_seconds,
                            :attempt_number,
                            :recorded_at
                        )
                        ON CONFLICT (id) DO NOTHING
                        """
                    ),
                    {
                        "id": uid(
                            f"{completion_key}-step-{index}"
                        ),
                        "completion_log_id": completion_id,
                        "worker_id": uid(worker_key),
                        "scenario_id": scenarios[scenario_key],
                        "step_key": step_key,
                        "step_index": index + 1,
                        "action_taken": (
                            "Correct procedure"
                            if correct
                            else "Incorrect procedure"
                        ),
                        "correct": correct,
                        "points_awarded": points,
                        "time_taken_seconds": max(
                            8,
                            int(duration / len(step_keys))
                            + (index * 2)
                        ),
                        "attempt_number": attempts,
                        "recorded_at": now - timedelta(days=days_ago),
                    },
                )

        # ----------------------------------------------------
        # 8. Audit logs
        # ----------------------------------------------------

        print("Seeding audit logs...")

        audit_entries = [
            (
                "admin_user",
                admin_id,
                "LOGIN",
                "admin_user",
                admin_id,
                '{"source":"demo"}',
            ),
            (
                "admin_user",
                admin_id,
                "VIEW_COMPLIANCE_DASHBOARD",
                None,
                None,
                '{"source":"demo"}',
            ),
            (
                "system",
                None,
                "SYNC_COMPLETION_RECORD",
                "completion_log",
                uid("completion-1001-fire"),
                '{"sync_path":"internet"}',
            ),
        ]

        for actor_type, actor_id, action, target_table, target_id, metadata in audit_entries:
            conn.execute(
                text(
                    """
                    INSERT INTO audit_log (
                        id,
                        actor_type,
                        actor_id,
                        action,
                        target_table,
                        target_id,
                        metadata
                    )
                    VALUES (
                        :id,
                        :actor_type,
                        :actor_id,
                        :action,
                        :target_table,
                        :target_id,
                        CAST(:metadata AS JSONB)
                    )
                    ON CONFLICT (id) DO NOTHING
                    """
                ),
                {
                    "id": uid(
                        f"audit-{actor_type}-{action}-{target_id}"
                    ),
                    "actor_type": actor_type,
                    "actor_id": actor_id,
                    "action": action,
                    "target_table": target_table,
                    "target_id": target_id,
                    "metadata": metadata,
                },
            )

    print()
    print("========================================")
    print("Khanan Mitra demo seed completed!")
    print("========================================")
    print()
    print("Demo admin:")
    print("Email:    admin@khananmitra.demo")
    print("Password: Demo@123")
    print()
    print("Seeded:")
    print("- 4 VTCs")
    print("- 12 workers")
    print("- 5 devices")
    print("- 12 completion records")
    print("- Step-level analytics")
    print("- 1 demo admin")
    print("- Audit records")
    print()
    print("IMPORTANT: Demo certificate JWT values are placeholders.")
    print("They are NOT cryptographically valid production certificates.")


if __name__ == "__main__":
    seed_database()