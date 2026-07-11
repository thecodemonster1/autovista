import { render, screen } from '@testing-library/react';

import type { Vehicle } from '@/lib/types';

import { VehicleCard } from '../VehicleCard';

const vehicle: Vehicle = {
  id: 'av-test',
  title: 'Toyota Aqua G Grade 2015',
  brand: 'Toyota',
  model: 'Aqua',
  year: 2015,
  condition: 'Used',
  transmission: 'Automatic',
  fuelType: 'Hybrid',
  engineCc: 1500,
  mileageKm: 95_000,
  bodyType: 'Hatchback',
  colour: 'Silver',
  location: 'Kurunegala',
  price: 8_200_000,
  description: 'Well-maintained hybrid hatchback.',
  featured: true,
  sellerType: 'Private seller',
  postedAt: '2026-07-01',
};

describe('VehicleCard', () => {
  it('renders the listing title, price and location', () => {
    render(<VehicleCard vehicle={vehicle} />);

    expect(screen.getByRole('heading', { name: vehicle.title })).toBeInTheDocument();
    expect(screen.getByText('Rs 8,200,000')).toBeInTheDocument();
    expect(screen.getByText('Kurunegala')).toBeInTheDocument();
    expect(screen.getByText('95,000 km')).toBeInTheDocument();
  });

  it('links to the vehicle detail page', () => {
    render(<VehicleCard vehicle={vehicle} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/vehicles/av-test');
  });

  it('shows the featured chip only for featured listings', () => {
    const { rerender } = render(<VehicleCard vehicle={vehicle} />);
    expect(screen.getByText('Featured')).toBeInTheDocument();

    rerender(<VehicleCard vehicle={{ ...vehicle, featured: false }} />);
    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });
});
