-- Optional PostgreSQL demo fixtures. Apply schema.sql first, before first app start.
-- The app provisions the administrator from ADMIN_EMAIL / ADMIN_PASSWORD.
BEGIN;
INSERT INTO nodes (node_id, hostname, ip_address, cpu_cores, cpu_usage,
 ram_total_gb, ram_usage, disk_total_gb, disk_usage, network_usage,
 active_jobs, idle_time_minutes, power_watts, temperature, utilization_score,
 monthly_cost_usd, running_services, uptime_hours, health_status, location, node_type, is_active)
SELECT 'Node-' || lpad(i::text, 3, '0'), 'demo-' || i || '.example.com',
 '10.0.0.' || i, 32, 20 + i * 2, 128, 15 + i * 2, 2000, 25 + i,
 15, 2, 120, 200, 45, 30, 75, 2, 720, 'healthy', 'DC-1', 'compute', true
FROM generate_series(1,20) AS i
ON CONFLICT (node_id) DO NOTHING;
INSERT INTO deployment_requests (request_id, customer_name, customer_email,
 service_type, service_name, job_type, required_cpu, required_ram_gb,
 required_disk_gb, estimated_runtime_min, priority, monthly_price, status, notes)
VALUES ('REQ-DEMO-001', 'Example Customer', 'customer@example.com', 'vps',
 'Business VPS Pro', 'Data Processing', 4, 8, 200, 60, 'Medium', 49.99,
 'pending', 'Synthetic reviewer fixture')
ON CONFLICT (request_id) DO NOTHING;
COMMIT;
