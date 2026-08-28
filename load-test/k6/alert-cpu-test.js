import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL;

export const options = {
  vus: 20,
  duration: '7m',
};

export default function () {
  const res = http.get(`${BASE_URL}/team-metrics`);

  check(res, {
    'team-metrics status is 200': (r) => r.status === 200,
  });
}