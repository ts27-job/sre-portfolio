USE giants_rds;

CREATE TABLE team_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(50),
    metric_value DECIMAL(10,3),
    updated_at DATETIME
);

INSERT INTO team_metrics
(metric_name, metric_value, updated_at)
VALUES
('team_avg', 0.235, NOW()),
('team_obp', 0.295, NOW()),
('team_slg', 0.352, NOW()),
('team_ops', 0.646, NOW()),
('risp_avg', 0.246, NOW()),
('team_era', 2.940, NOW()),
('starter_era', 3.110, NOW()),
('bullpen_era', 2.660, NOW()),
('qs_rate', 51.300, NOW()),

CREATE TABLE alert_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(50),
    operator VARCHAR(10),
    threshold DECIMAL(10,3),
    severity VARCHAR(20)
);

INSERT INTO alert_rules
(metric_name, operator, threshold, severity)
VALUES
('team_avg', '<', 0.230, 'Warning'),
('team_obp', '<', 0.300, 'Warning'),
('team_slg', '<', 0.400, 'Warning'),
('team_ops', '<', 0.650, 'Warning'),
('risp_avg', '<', 0.250, 'Warning'),
('team_era', '>', 3.300, 'Warning'),
('starter_era', '>', 3.300, 'Warning'),
('bullpen_era', '>', 3.300, 'Critical'),
('qs_rate', '<', 45.000, 'Warning');

CREATE TABLE alert_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(50),
    metric_value DECIMAL(10,3),
    severity VARCHAR(20),
    message VARCHAR(255),
    detected_at DATETIME
);