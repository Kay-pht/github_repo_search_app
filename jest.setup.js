import 'whatwg-fetch';
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '0px',
  thresholds: [0],
  takeRecords: jest.fn(),
}));

// Mock window.location
delete window.location;
window.location = {
  search: '',
  href: '',
  pathname: '',
  hostname: '',
  origin: '',
  protocol: '',
  port: '',
  host: '',
  hash: '',
  reload: jest.fn(),
  replace: jest.fn(),
  assign: jest.fn(),
};
