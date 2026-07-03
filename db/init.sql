USE giants_sre;

CREATE TABLE team_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(50),
    metric_value DECIMAL(10,2),
    updated_at DATETIME
);

INSERT INTO team_metrics
(metric_name, metric_value, updated_at)
VALUES
('team_era', 2.95, NOW()),
('bullpen_era', 4.80, NOW()),
('team_ops', 0.65, NOW()),
('games_under_500', 3, NOW()),
('losing_streak', 2, NOW());

CREATE TABLE alert_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(50),
    operator VARCHAR(10),
    threshold DECIMAL(10,2),
    severity VARCHAR(20)
);

INSERT INTO alert_rules
(metric_name, operator, threshold, severity)
VALUES
('bullpen_era', '>', 4.50, 'Critical'),
('team_ops', '<', 0.70, 'Warning'),
('games_under_500', '>=', 5, 'Critical'),
('losing_streak', '>=', 3, 'Warning');

CREATE TABLE alert_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(50),
    metric_value DECIMAL(10,2),
    severity VARCHAR(20),
    message VARCHAR(255),
    detected_at DATETIME
);