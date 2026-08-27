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
('whip', 1.180, NOW());

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
('team_ops', '<', 0.650, 'Warning'),
('risp_avg', '<', 0.240, 'Warning'),
('team_era', '>', 3.500, 'Warning'),
('starter_era', '>', 3.500, 'Warning'),
('bullpen_era', '>', 4.000, 'Critical'),
('qs_rate', '<', 50.000, 'Warning'),
('whip', '>', 1.300, 'Warning');

CREATE TABLE alert_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(50),
    metric_value DECIMAL(10,3),
    severity VARCHAR(20),
    message VARCHAR(255),
    detected_at DATETIME
);