// client/src/components/MatchCard.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import MatchCard from './MatchCard';
import { expect } from 'vitest';

describe('MatchCard', () => {
  const upcomingMatch = {
    time: '18:00',
    team1: 'Team A',
    team2: 'Team B',
    status: 'upcoming',
  };

  const completedMatchTeamAWin = {
    time: '19:30',
    team1: 'Team X',
    score1: 3,
    team2: 'Team Y',
    score2: 1,
    status: 'completed',
    winner: 'Team X',
  };

  const completedMatchTeamBWin = {
    time: '20:00',
    team1: 'Team M',
    score1: 0,
    team2: 'Team N',
    score2: 2,
    status: 'completed',
    winner: 'Team N',
  };

  it('should render team names correctly for an upcoming match', () => {
    render(<MatchCard match={upcomingMatch} />);
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });

  it('should show "VS" if status is upcoming', () => {
    render(<MatchCard match={upcomingMatch} />);
    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('should show scores and highlight the winner for a completed match (Team A wins)', () => {
    render(<MatchCard match={completedMatchTeamAWin} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3').closest('span')).toHaveClass('text-green-500');
    expect(screen.getByText('Team X')).toHaveClass('text-green-500');
    expect(screen.getByText('Team Y')).not.toHaveClass('text-green-500');
  });

  it('should show scores and highlight the winner for a completed match (Team B wins)', () => {
    render(<MatchCard match={completedMatchTeamBWin} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('2').closest('span')).toHaveClass('text-green-500');
    expect(screen.getByText('Team N')).toHaveClass('text-green-500');
    expect(screen.getByText('Team M')).not.toHaveClass('text-green-500');
  });

  it('should display the time and status correctly', () => {
    render(<MatchCard match={upcomingMatch} />);
    expect(screen.getByText('18:00')).toBeInTheDocument();
    expect(screen.getByText('upcoming')).toBeInTheDocument();
  });

  // Test fallback for team logos (if /img/teams is not moved)
  // This test requires careful setup or mocking to test the onError handler
  // For now, we assume the onError is correctly implemented to use a placeholder.
  it('should have team logo images with correct alt text', () => {
    render(<MatchCard match={upcomingMatch} />);
    const teamAImage = screen.getByAltText('Team A');
    const teamBImage = screen.getByAltText('Team B');
    expect(teamAImage).toBeInTheDocument();
    expect(teamBImage).toBeInTheDocument();
    expect(teamAImage).toHaveAttribute('src', '/img/teams/Team-A.png');
    expect(teamBImage).toHaveAttribute('src', '/img/teams/Team-B.png');
  });
});
