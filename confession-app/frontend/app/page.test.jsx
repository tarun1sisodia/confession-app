import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Page from './page';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>
}));

describe('Frontend Base Render Tests', () => {
  it('should render the homepage ConfessionExperience component without crashing', () => {
    render(<Page />);
    
    // Check if basic structure works
    expect(screen.getByText(/Fresh anonymous confessions/i)).toBeDefined();
    
    // Check if navigation elements load
    expect(screen.getByText('Explore')).toBeDefined();
    expect(screen.getByText('Hearts')).toBeDefined();
  });
});
