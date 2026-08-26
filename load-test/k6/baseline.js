import http from 'k6/http';
import { check, sleep, group } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  vus: 5,
  duration: '1m',
};

export default function () {
  group('health check', function () {
    const res = http.get(`${BASE_URL}/health`);

    check(res, {
      'health status is 200': (r) => r.status === 200,
    });
  });

  group('team metrics API', function () {
    const res = http.get(`${BASE_URL}/team-metrics`);

    check(res, {
      'team-metrics status is 200': (r) => r.status === 200,
    });
  });

  group('alerts API', function () {
    const res = http.get(`${BASE_URL}/alerts`);

    check(res, {
      'alerts status is 200': (r) => r.status === 200,
    });
  });

  group('alert rules API', function () {
    const res = http.get(`${BASE_URL}/alert-rules`);

    check(res, {
      'alert-rules status is 200': (r) => r.status === 200,
    });
  });

  sleep(1);
}