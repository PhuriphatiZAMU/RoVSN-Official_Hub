'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import apiService from '@/lib/api-client';
import TeamLogo from '@/components/common/TeamLogo';
import { useLanguage } from '@/components/providers/LanguageProvider';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function AdminDrawPage() {
    const { t } = useLanguage();

    // Teams Management
    const [teams, setTeams] = useState<string[]>([]);

    // Draw State
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawComplete, setDrawComplete] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [matchDays, setMatchDays] = useState<any[]>([]);
    const [displayedMatches, setDisplayedMatches] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [message, setMessage] = useState<{ type: string, text: string } | null>(null);

    // Edit Team State
    const [newTeamName, setNewTeamName] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    // Custom Dates
    const [startDate, setStartDate] = useState('');
    const [customMatchDates, setCustomMatchDates] = useState<Record<number, string>>({});

    const handleStartDateChange = (date: string) => {
        setStartDate(date);

        // Auto-fill subsequent dates
        if (date && teams.length > 0) {
            const start = new Date(date);
            const totalRounds = teams.length % 2 === 0 ? teams.length - 1 : teams.length;
            const newDates: Record<number, string> = {};

            for (let i = 0; i < totalRounds; i++) {
                const currentDate = new Date(start);
                currentDate.setDate(start.getDate() + i); // Assuming daily matches, user can edit later
                newDates[i + 1] = currentDate.toISOString().split('T')[0];
            }
            setCustomMatchDates(newDates);
        }
    };

    // Logo Modal State
    const [logoModalOpen, setLogoModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [logoUploadMode, setLogoUploadMode] = useState<'file' | 'url'>('file');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoUrlInput, setLogoUrlInput] = useState('');
    const [logoPreview, setLogoPreview] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // Playoff Schedule State
    const [playoffTeams, setPlayoffTeams] = useState<{ rank1: string; rank2: string; rank3: string; rank4: string }>({
        rank1: '', rank2: '', rank3: '', rank4: ''
    });
    const [savingPlayoffs, setSavingPlayoffs] = useState(false);
    const [loadingStandings, setLoadingStandings] = useState(false);
    const [standingsLoaded, setStandingsLoaded] = useState(false);

    // Tournament Progress State
    const [tournamentStatus, setTournamentStatus] = useState<{
        leagueComplete: boolean;
        semiFinalExists: boolean;
        semiFinalComplete: boolean;
        finalsExists: boolean;
        semiFinalResults: { sf1Winner?: string; sf1Loser?: string; sf2Winner?: string; sf2Loser?: string };
        leagueMatchesTotal: number;
        leagueMatchesCompleted: number;
    }>({
        leagueComplete: false,
        semiFinalExists: false,
        semiFinalComplete: false,
        finalsExists: false,
        semiFinalResults: {},
        leagueMatchesTotal: 0,
        leagueMatchesCompleted: 0
    });
    const [loadingStatus, setLoadingStatus] = useState(true);

    useEffect(() => {
        fetchRosterTeams();
        fetchTournamentStatus();
    }, []);

    const fetchRosterTeams = async () => {
        try {
            const players = await apiService.getPlayers();
            if (players) {
                const rosterTeams = [...new Set(players.map(p => p.team).filter((t): t is string => !!t))].sort();
                if (rosterTeams.length > 0) {
                    setTeams(rosterTeams);
                }
            }
        } catch (err) {
            console.error("Failed to auto-load teams:", err);
        }
    };

    const [debugMsg, setDebugMsg] = useState<string>('');

    const fetchTournamentStatus = async () => {
        setLoadingStatus(true);
        setLoadingStandings(true);
        setDebugMsg(''); // Clear debug
        try {
            const [scheduleData, resultsData, standings] = await Promise.all([
                apiService.getSchedule(),
                apiService.getResults(),
                apiService.getStandings()
            ]);

            // Debug Standings
            if (!standings || standings.length === 0) {
                setDebugMsg('API returned empty standings array.');
            } else {
                setDebugMsg(`Loaded ${standings.length} items from standings. First item: ${JSON.stringify(standings[0])}`);
            }

            const scheduleList = (scheduleData as any).schedule || scheduleData || [];
            const results = resultsData || [];

            // Check league days (Day 1-9 or any day < 10)
            const leagueDays = scheduleList.filter((d: any) => d.day < 10);
            const leagueMatches = leagueDays.flatMap((d: any) =>
                (d.matches || []).map((m: any) => ({
                    matchId: `${d.day}_${m.blue}_vs_${m.red}`.replace(/\s+/g, ''),
                    ...m
                }))
            );
            const leagueMatchesCompleted = leagueMatches.filter((m: any) =>
                results.some((r: any) => r.matchId === m.matchId)
            ).length;
            const leagueComplete = leagueMatches.length > 0 && leagueMatchesCompleted === leagueMatches.length;

            // Check Semi Finals (Day 10)
            const semiDay = scheduleList.find((d: any) => d.day === 10);
            const semiFinalExists = semiDay && semiDay.matches && semiDay.matches.length > 0;

            let semiFinalComplete = false;
            let semiFinalResults: any = {};

            if (semiFinalExists) {
                const sf1 = semiDay.matches[0];
                const sf2 = semiDay.matches[1];
                const sf1MatchId = `10_${sf1.blue}_vs_${sf1.red}`.replace(/\s+/g, '');
                const sf2MatchId = `10_${sf2.blue}_vs_${sf2.red}`.replace(/\s+/g, '');

                const sf1Result = results.find((r: any) => r.matchId === sf1MatchId);
                const sf2Result = results.find((r: any) => r.matchId === sf2MatchId);

                semiFinalComplete = !!(sf1Result && sf2Result);

                if (sf1Result) {
                    semiFinalResults.sf1Winner = sf1Result.winner;
                    semiFinalResults.sf1Loser = sf1Result.winner === sf1Result.teamBlue ? sf1Result.teamRed : sf1Result.teamBlue;
                }
                if (sf2Result) {
                    semiFinalResults.sf2Winner = sf2Result.winner;
                    semiFinalResults.sf2Loser = sf2Result.winner === sf2Result.teamBlue ? sf2Result.teamRed : sf2Result.teamBlue;
                }
            }

            // Check Finals (Day 11)
            const finalsDay = scheduleList.find((d: any) => d.day === 11);
            const finalsExists = finalsDay && finalsDay.matches && finalsDay.matches.length > 0;

            setTournamentStatus({
                leagueComplete,
                semiFinalExists,
                semiFinalComplete,
                finalsExists,
                semiFinalResults,
                leagueMatchesTotal: leagueMatches.length,
                leagueMatchesCompleted
            });

            // Load standings for playoff teams
            let loadedFromStandings = false;

            if (standings && standings.length > 0) {
                console.log('Standings Raw Data:', standings);

                const sorted = [...standings].sort((a: any, b: any) => {
                    // Normalize Team Names first for H2H lookup
                    const teamNameA = a.team || a.name || a.teamName || '';
                    const teamNameB = b.team || b.name || b.teamName || '';

                    // 1. Points
                    const ptsA = a.points !== undefined ? a.points : (a.pts !== undefined ? a.pts : ((a.won || a.w || a.gamesWon || 0) * 3));
                    const ptsB = b.points !== undefined ? b.points : (b.pts !== undefined ? b.pts : ((b.won || b.w || b.gamesWon || 0) * 3));

                    if (ptsB !== ptsA) return ptsB - ptsA;

                    // 2. Game Difference
                    const diffA = a.gameDiff !== undefined ? a.gameDiff : (a.gd !== undefined ? a.gd : ((a.gamesWon || 0) - (a.gamesLost || 0)));
                    const diffB = b.gameDiff !== undefined ? b.gameDiff : (b.gd !== undefined ? b.gd : ((b.gamesWon || 0) - (b.gamesLost || 0)));

                    if (diffB !== diffA) return diffB - diffA;

                    // 3. Head-to-Head (H2H)
                    // If points and GD are equal, check who won when they played each other
                    if (results && results.length > 0) {
                        const h2hMatch = results.find((r: any) =>
                            (r.teamBlue === teamNameA && r.teamRed === teamNameB) ||
                            (r.teamBlue === teamNameB && r.teamRed === teamNameA)
                        );

                        if (h2hMatch) {
                            // If A defeated B, A should be higher (return negative)
                            if (h2hMatch.winner === teamNameA) return -1;
                            if (h2hMatch.winner === teamNameB) return 1;
                        }
                    }

                    // 4. Total Wins
                    const winsA = a.won !== undefined ? a.won : (a.w !== undefined ? a.w : 0);
                    const winsB = b.won !== undefined ? b.won : (b.w !== undefined ? b.w : 0);
                    if (winsB !== winsA) return winsB - winsA;

                    // 5. Fallback: Alphabetical
                    return teamNameA.localeCompare(teamNameB);
                });

                // Filter out empty team names & Normalize team name
                const validTeams = sorted
                    .map((s: any) => ({
                        ...s,
                        teamName: s.team || s.name || s.teamName || ''
                    }))
                    .filter((s: any) => s.teamName && s.teamName.trim() !== '');

                console.log('Valid Teams (Sorted):', validTeams);

                if (validTeams.length >= 4) {
                    setPlayoffTeams({
                        rank1: validTeams[0]?.teamName || '',
                        rank2: validTeams[1]?.teamName || '',
                        rank3: validTeams[2]?.teamName || '',
                        rank4: validTeams[3]?.teamName || ''
                    });
                    setStandingsLoaded(true);
                    loadedFromStandings = true;
                } else {
                    console.log('Not enough valid teams in standings:', validTeams.length);
                    setDebugMsg(prev => prev + ` | Valid teams found: ${validTeams.length}. Need 4.`);
                }
            }

            // Fallback: extract teams from schedule if standings not complete
            if (!loadedFromStandings) {
                const allTeamsInSchedule = new Set<string>();
                leagueDays.forEach((d: any) => {
                    (d.matches || []).forEach((m: any) => {
                        if (m.blue && m.blue.trim()) allTeamsInSchedule.add(m.blue.trim());
                        if (m.red && m.red.trim()) allTeamsInSchedule.add(m.red.trim());
                    });
                });

                const teamsArray = Array.from(allTeamsInSchedule).sort();
                console.log('Teams from schedule:', teamsArray);

                // Also update the global teams list if it's empty
                if (teamsArray.length > 0 && teams.length === 0) {
                    setTeams(teamsArray);
                }

                if (teamsArray.length >= 4) {
                    // Start: Fallback Teams Loaded
                    setDebugMsg(prev => prev + ' | Fallback teams loaded from schedule (Alphabetical). Please select Top 4 teams manually.');

                    // We DO NOT auto-populate playoffTeams here anymore to avoid incorrect alphabetical selection.
                    // User must verify standings or select manually.
                }
            }
        } catch (err: any) {
            console.error("Failed to load tournament status:", err);
            setDebugMsg(`Error: ${err.message}`);
        } finally {
            setLoadingStatus(false);
            setLoadingStandings(false);
        }
    };

    const fetchStandings = async () => {
        fetchTournamentStatus();
    };

    // --- Team Management ---

    const addTeam = () => {
        const name = newTeamName.trim();
        if (!name) {
            setMessage({ type: 'error', text: 'Team name cannot be empty' });
            return;
        }
        if (teams.includes(name)) {
            setMessage({ type: 'error', text: 'Team name already exists' });
            return;
        }
        setTeams([...teams, name]);
        setNewTeamName('');
        setMessage({ type: 'success', text: `Added team ${name}` });
    };

    const deleteTeam = async (index: number) => {
        const teamName = teams[index];
        const result = await Swal.fire({
            title: `Remove ${teamName}?`,
            text: "This removes the team from the draw list only.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Remove'
        });

        if (result.isConfirmed) {
            setTeams(prev => prev.filter((_, i) => i !== index));
            setMessage({ type: 'success', text: `Removed ${teamName}` });
        }
    };

    const startEditing = (index: number) => {
        setEditingIndex(index);
        setEditingName(teams[index]);
    };

    const saveEdit = () => {
        const name = editingName.trim();
        if (!name) return;
        if (teams.some((t, i) => t === name && i !== editingIndex)) {
            setMessage({ type: 'error', text: 'Duplicate team name' });
            return;
        }
        const newTeams = [...teams];
        newTeams[editingIndex!] = name;
        setTeams(newTeams);
        setEditingIndex(null);
        setEditingName('');
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditingName('');
    };

    // --- Round Robin Logic ---

    const calculateTotalRounds = (teamCount: number) => {
        if (teamCount < 2) return 0;
        const isEven = teamCount % 2 === 0;
        return isEven ? teamCount - 1 : teamCount;
    };

    const totalRounds = calculateTotalRounds(teams.length);

    const handleDateChange = (day: number, value: string) => {
        setCustomMatchDates(prev => ({ ...prev, [day]: value }));
    };

    const generateRoundRobin = (teamList: string[]) => {
        const n = teamList.length;
        const rounds = [];
        const teamsCopy = [...teamList];

        if (n % 2 !== 0) {
            teamsCopy.push('BYE');
        }

        const numRounds = teamsCopy.length - 1;
        const halfSize = teamsCopy.length / 2;
        const teamIndexes = teamsCopy.map((_, i) => i).slice(1);

        const getRoundDate = (roundNum: number) => customMatchDates[roundNum] || '';

        for (let round = 0; round < numRounds; round++) {
            const roundMatches = [];
            const newIndexes = [0].concat(teamIndexes);

            for (let i = 0; i < halfSize; i++) {
                const home = teamsCopy[newIndexes[i]];
                const away = teamsCopy[newIndexes[newIndexes.length - 1 - i]];

                if (home !== 'BYE' && away !== 'BYE') {
                    roundMatches.push({
                        blue: home,
                        red: away,
                        time: '18:00',
                        date: getRoundDate(round + 1) // Add date to match
                    });
                }
            }

            rounds.push({
                day: round + 1,
                date: getRoundDate(round + 1),
                matches: roundMatches
            });

            teamIndexes.push(teamIndexes.shift()!);
        }

        return rounds;
    };

    const startDraw = () => {
        if (teams.length < 2) {
            setMessage({ type: 'error', text: 'Need at least 2 teams' });
            return;
        }

        setIsDrawing(true);
        setDrawComplete(false);
        setCurrentStep(0);
        setDisplayedMatches([]);
        setMessage(null);

        const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
        const rounds = generateRoundRobin(shuffledTeams);
        setMatchDays(rounds);

        let step = 0;
        const allMatches = rounds.flatMap((r, dayIndex) =>
            r.matches.map(m => ({ ...m, day: dayIndex + 1 }))
        );

        if (allMatches.length > 0) {
            setDisplayedMatches([allMatches[0]]);
            setCurrentStep(1);
            step = 1;
        }

        const interval = setInterval(() => {
            if (step < allMatches.length) {
                setDisplayedMatches(prev => [...prev, allMatches[step]]);
                setCurrentStep(step + 1);
                step++;
            } else {
                clearInterval(interval);
                setIsDrawing(false);
                setDrawComplete(true);
            }
        }, 250);
    };

    const saveToFixtures = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const payload = {
                schedule: matchDays,
                teams: teams
            };

            await apiService.createSchedule(payload);

            setMessage({ type: 'success', text: 'Fixtures saved successfully' });
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    const clearAllFixtures = async () => {
        const result = await Swal.fire({
            title: 'Clear All Fixtures?',
            text: "This will delete all schedule and results data!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, Clear All'
        });

        if (result.isConfirmed) {
            setClearing(true);
            try {
                await axios.delete(`${API_BASE}/schedules/clear`, { withCredentials: true });
                setMessage({ type: 'success', text: 'All fixture data cleared.' });
                setTimeout(() => window.location.reload(), 1500);
            } catch (error: any) {
                setMessage({ type: 'error', text: error.message });
                setClearing(false);
            }
        }
    };

    const resetDraw = () => {
        setIsDrawing(false);
        setDrawComplete(false);
        setCurrentStep(0);
        setMatchDays([]);
        setDisplayedMatches([]);
        setMessage(null);
    };

    // --- Playoff Schedule Logic ---

    // Create Semi Finals schedule from standings (Day 90)
    const createSemiFinals = async () => {
        const { rank1, rank2, rank3, rank4 } = playoffTeams;

        if (!rank1 || !rank2 || !rank3 || !rank4) {
            setMessage({ type: 'error', text: 'Standings not loaded - cannot create Semi Finals' });
            return;
        }

        const result = await Swal.fire({
            title: 'Create Semi Finals?',
            html: `
                <div class="text-left">
                    <p class="mb-2">Based on current standings (Rule: 1vs2, 3vs4 | BO5):</p>
                    <p><strong>🅰️ Semi Final 1:</strong> ${rank1} (1st) vs ${rank2} (2nd)</p>
                    <p><strong>🅱️ Semi Final 2:</strong> ${rank3} (3rd) vs ${rank4} (4th)</p>
                    <p class="text-xs text-orange-600 mt-1 font-bold">Format: Best of 5 (BO5)</p>
                    <div class="mt-4">
                        <label class="block text-sm font-bold text-gray-700 mb-1">Select Date:</label>
                        <input id="swal-sf-date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500">
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f97316',
            confirmButtonText: 'Create Semi Finals',
            preConfirm: () => {
                const dateInput = document.getElementById('swal-sf-date') as HTMLInputElement;
                return dateInput.value;
            }
        });

        if (!result.isConfirmed) return;

        const selectedDate = result.value || '';
        console.log('Selected Date for Semi Finals:', selectedDate); // Debug Date

        setSavingPlayoffs(true);
        setMessage(null);

        try {
            const semiFinalSchedule = {
                day: 10,
                date: selectedDate,
                matches: [
                    { blue: rank1, red: rank2, time: '18:00', date: selectedDate }, // Add date to matches too
                    { blue: rank3, red: rank4, time: '19:00', date: selectedDate }
                ]
            };

            const existingData = await apiService.getSchedule();
            const existingSchedule = (existingData as any).schedule || existingData || [];

            console.log('Existing Schedule Length:', existingSchedule.length);

            // Remove any existing playoff days (>= 10) to overwrite
            const filteredSchedule = existingSchedule.filter((d: any) => d.day < 10);

            const newSchedule = [...filteredSchedule, semiFinalSchedule];

            console.log('Sending New Schedule Payload:', { schedule: newSchedule, teams });

            const saveResult = await apiService.createSchedule({ schedule: newSchedule, teams });
            console.log('Save Result:', saveResult);

            setMessage({ type: 'success', text: 'Semi Finals created successfully!' });

            Swal.fire({
                icon: 'success',
                title: 'Semi Finals Created!',
                html: `
                    <div class="text-left">
                        <p class="font-bold mb-2">🥊 Semi Finals (Day 10):</p>
                        <p>• ${rank1} vs ${rank2}</p>
                        <p>• ${rank3} vs ${rank4}</p>
                        <p class="mt-3 text-gray-500 text-sm">Enter results in the Results page, then come back to create Finals Day.</p>
                    </div>
                `,
                confirmButtonText: 'OK'
            });

            // Force delay before refresh to ensure DB write
            setTimeout(async () => {
                await fetchTournamentStatus();
                setSavingPlayoffs(false);
            }, 1000);

        } catch (error: any) {
            console.error('Error creating Semi Finals:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to create Semi Finals' });
            setSavingPlayoffs(false);
        }
    };

    // Create Finals Day schedule from Semi Finals results (Day 91)
    const createFinalsDay = async () => {
        const { sf1Winner, sf1Loser, sf2Winner, sf2Loser } = tournamentStatus.semiFinalResults;

        if (!sf1Winner || !sf1Loser || !sf2Winner || !sf2Loser) {
            setMessage({ type: 'error', text: 'Semi Finals results not complete' });
            return;
        }

        const result = await Swal.fire({
            title: 'Create Grand Finals?',
            html: `
                <div class="text-left">
                    <p class="mb-2">Based on Semi Finals results (Rule: BO5):</p>
                    <p><strong>🥉 3rd Place Match:</strong> ${sf1Loser} vs ${sf2Loser} <span class="text-xs font-bold text-gray-500">(BO5)</span></p>
                    <p class="text-xs text-gray-500 ml-4">← Semi Final losers</p>
                    <p class="mt-2"><strong>🏆 Grand Final:</strong> ${sf1Winner} vs ${sf2Winner} <span class="text-xs font-bold text-orange-600">(BO5)</span></p>
                    <p class="text-xs text-gray-500 ml-4">← Semi Final winners</p>
                    <div class="mt-4">
                        <label class="block text-sm font-bold text-gray-700 mb-1">Select Date:</label>
                        <input id="swal-gf-date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500">
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#eab308',
            confirmButtonText: 'Create Grand Finals',
            preConfirm: () => {
                const dateInput = document.getElementById('swal-gf-date') as HTMLInputElement;
                return dateInput.value;
            }
        });

        if (!result.isConfirmed) return;

        const selectedDate = result.value || '';

        setSavingPlayoffs(true);
        setMessage(null);

        try {
            const finalsDaySchedule = {
                day: 11,
                date: selectedDate,
                matches: [
                    { blue: sf1Loser, red: sf2Loser, time: '13:00' },   // 3rd Place Match
                    { blue: sf1Winner, red: sf2Winner, time: '15:00' } // Grand Finals
                ]
            };

            const existingData = await apiService.getSchedule();
            const existingSchedule = (existingData as any).schedule || existingData || [];

            // Remove existing Day 11 only
            const filteredSchedule = existingSchedule.filter((d: any) => d.day !== 11);

            const newSchedule = [...filteredSchedule, finalsDaySchedule];
            await apiService.createSchedule({ schedule: newSchedule, teams });

            setMessage({ type: 'success', text: 'Grand Finals created!' });

            Swal.fire({
                icon: 'success',
                title: '🏆 Grand Finals Created!',
                html: `
                    <div class="text-left">
                        <p class="font-bold mb-2">Grand Finals Day (Day 11):</p>
                        <p>• 🥉 3rd Place Match: ${sf1Loser} vs ${sf2Loser}</p>
                        <p class="text-xs text-gray-500 ml-4">(Semi Final losers)</p>
                        <p>• 🏆 Grand Final: ${sf1Winner} vs ${sf2Winner}</p>
                        <p class="text-xs text-gray-500 ml-4">(Semi Final winners)</p>
                    </div>
                `,
                confirmButtonText: 'OK'
            });

            // Refresh status
            await fetchTournamentStatus();

        } catch (error: any) {
            console.error('Error creating Grand Finals:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to create Grand Finals' });
        } finally {
            setSavingPlayoffs(false);
        }
    };

    // --- Logo Modal Logic ---

    const openLogoModal = (teamName: string) => {
        setSelectedTeam(teamName);
        setLogoModalOpen(true);
        setLogoUploadMode('file');
        setLogoFile(null);
        setLogoUrlInput('');
        setLogoPreview('');
    };

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const saveLogo = async () => {
        if (!selectedTeam) return;
        setUploadingLogo(true);
        try {
            let finalUrl = logoUrlInput;

            if (logoUploadMode === 'file' && logoFile) {
                const formData = new FormData();
                formData.append('logo', logoFile);
                const result = await apiService.uploadImage(formData);
                finalUrl = result.url;
            }

            if (finalUrl) {
                await apiService.createTeamLogo({ teamName: selectedTeam, logoUrl: finalUrl });
                setMessage({ type: 'success', text: 'Logo saved successfully' });
                setLogoModalOpen(false);
            }
        } catch (err: any) {
            console.error(err);
            Swal.fire('Error', 'Failed to save logo', 'error');
        } finally {
            setUploadingLogo(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <h1 className="text-2xl font-display font-bold text-uefa-dark">
                <i className="fas fa-random mr-3 text-cyan-aura"></i>
                {t.admin.drawPage?.title || 'Tournament Draw'}
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

                {/* Team Management */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700 text-lg">
                            <i className="fas fa-users mr-2 text-cyan-aura"></i>
                            {t.admin.drawPage?.manageTeams || 'Manage Teams'} ({teams.length})
                        </h3>
                    </div>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTeam()}
                            placeholder="Add Team Name"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-aura"
                        />
                        <button
                            onClick={addTeam}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold"
                        >
                            <i className="fas fa-plus mr-1"></i> Add
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {teams.map((team, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 group hover:border-cyan-aura transition-all">
                                {editingIndex === index ? (
                                    <div className="flex items-center gap-1 flex-1">
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                                            className="w-full px-2 py-1 text-sm border border-cyan-aura rounded focus:outline-none"
                                            autoFocus
                                        />
                                        <button onClick={saveEdit} className="text-green-500 hover:text-green-600"><i className="fas fa-check"></i></button>
                                        <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <TeamLogo teamName={team} size="sm" />
                                            <span className="font-medium text-gray-700 truncate text-sm" title={team}>{team}</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openLogoModal(team)} className="text-gray-400 hover:text-cyan-aura p-1" title="Change Logo"><i className="fas fa-image text-xs"></i></button>
                                            <button onClick={() => startEditing(index)} className="text-blue-400 hover:text-blue-600 p-1" title="Edit"><i className="fas fa-edit text-xs"></i></button>
                                            <button onClick={() => deleteTeam(index)} className="text-red-400 hover:text-red-600 p-1" title="Remove"><i className="fas fa-trash text-xs"></i></button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Date Settings */}
                {!isDrawing && !drawComplete && teams.length >= 2 && (
                    <div className="mb-8 border-t border-gray-100 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700 text-lg">
                                <i className="fas fa-calendar-alt mr-2 text-cyan-aura"></i>
                                Date Settings ({totalRounds} Days)
                            </h3>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600 font-bold">Start Date:</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => handleStartDateChange(e.target.value)}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-cyan-aura focus:outline-none"
                                />
                                <span className="text-xs text-gray-400 ml-1">(Auto-fill)</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {Array.from({ length: totalRounds }).map((_, i) => {
                                const day = i + 1;
                                return (
                                    <div key={day} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="text-xs font-bold text-gray-500 mb-1">Round {day}</div>
                                        <input
                                            type="date"
                                            value={customMatchDates[day] || ''}
                                            onChange={(e) => handleDateChange(day, e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-cyan-aura outline-none"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    {!isDrawing && !drawComplete && (
                        <button
                            onClick={startDraw}
                            disabled={teams.length < 2}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-aura to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-aura/50 disabled:opacity-50 transition-all"
                        >
                            <i className="fas fa-dice"></i> Start Draw
                        </button>
                    )}

                    {drawComplete && (
                        <>
                            <button
                                onClick={saveToFixtures}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
                            >
                                {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                                Save Fixtures
                            </button>
                            <button
                                onClick={resetDraw}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
                            >
                                <i className="fas fa-redo"></i> Reset
                            </button>
                        </>
                    )}

                    <button
                        onClick={clearAllFixtures}
                        disabled={clearing}
                        className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition-all ml-auto"
                    >
                        {clearing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash-alt"></i>}
                        Clear Fixtures
                    </button>
                </div>

                {message && (
                    <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                        {message.text}
                    </div>
                )}
            </div>

            {/* Drawing Animation / Results */}
            {(isDrawing || drawComplete) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-uefa-dark uppercase flex items-center gap-2">
                            <i className="fas fa-list-ol text-cyan-aura"></i>
                            Draw Results
                        </h3>
                        {isDrawing && (
                            <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold animate-pulse">
                                Drawing...
                            </span>
                        )}
                    </div>
                    <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matchDays.filter(round => round && round.day && round.matches).map((round) => (
                            <div key={round.day} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                    <span className="font-bold text-gray-700">Round {round.day}</span>
                                    {drawComplete ? (
                                        <input
                                            type="date"
                                            value={round.date || ''}
                                            onChange={(e) => {
                                                const newDate = e.target.value;
                                                setMatchDays(prev => prev.map(r => r.day === round.day ? {
                                                    ...r,
                                                    date: newDate,
                                                    matches: r.matches.map((m: any) => ({ ...m, date: newDate })) // Also update match dates
                                                } : r));
                                                // Also update customMatchDates to keep sync
                                                setCustomMatchDates(prev => ({ ...prev, [round.day]: newDate }));
                                            }}
                                            className="text-xs text-gray-600 border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-cyan-aura"
                                        />
                                    ) : (
                                        <span className="text-xs text-gray-500">{round.date}</span>
                                    )}
                                </div>
                                <div className="p-2 space-y-2">
                                    {round.matches.map((match: any, idx: number) => {
                                        const matchesBefore = matchDays.filter(r => r.day < round.day).reduce((sum, r) => sum + r.matches.length, 0);
                                        const globalIdx = matchesBefore + idx;
                                        const isRevealed = drawComplete || globalIdx < displayedMatches.length;

                                        return (
                                            <div key={idx} className={`flex items-center justify-between p-2 rounded-lg text-sm transition-all duration-300 ${isRevealed ? 'bg-white border border-gray-100 shadow-sm' : 'bg-gray-100 opacity-50'}`}>
                                                <div className="flex-1 font-bold text-blue-700 truncate">{isRevealed ? match.blue : '???'}</div>
                                                <div className="px-2 text-xs text-gray-400 font-bold">VS</div>
                                                <div className="flex-1 font-bold text-red-700 truncate text-right">{isRevealed ? match.red : '???'}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Playoff Schedule Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <i className="fas fa-trophy text-2xl text-orange-500"></i>
                            <div>
                                <h3 className="text-xl font-bold text-uefa-dark">PLAYOFF SCHEDULE</h3>
                                <p className="text-sm text-gray-500">Create Semi Finals and Finals Day based on results</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchTournamentStatus}
                            className="px-4 py-2 bg-white border border-gray-200 text-orange-600 text-sm font-bold rounded-lg hover:bg-orange-50 shadow-sm"
                        >
                            <i className={`fas fa-sync-alt mr-2 ${loadingStandings ? 'fa-spin' : ''}`}></i>
                            Refresh Status
                        </button>
                    </div>

                    {debugMsg && (
                        <div className="bg-gray-800 border border-gray-700 text-green-400 p-3 text-xs font-mono rounded-lg overflow-x-auto select-all">
                            <strong>DEBUG LOG:</strong> {debugMsg}
                        </div>
                    )}
                </div>

                <div className="p-6">
                    {loadingStatus ? (
                        <div className="text-center py-8">
                            <i className="fas fa-spinner fa-spin text-3xl text-orange-400 mb-3"></i>
                            <p className="text-gray-500">Loading tournament status...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Step 1: League Phase Progress */}
                            <div className={`p-4 rounded-xl border-2 ${tournamentStatus.leagueComplete ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${tournamentStatus.leagueComplete ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'}`}>
                                        {tournamentStatus.leagueComplete ? <i className="fas fa-check"></i> : '1'}
                                    </div>
                                    <h4 className="font-bold text-gray-700">League Phase</h4>
                                </div>
                                <div className="ml-11">
                                    {tournamentStatus.leagueComplete ? (
                                        <p className="text-green-600 font-bold">✅ Complete - All {tournamentStatus.leagueMatchesTotal} matches finished</p>
                                    ) : (
                                        <div>
                                            <p className="text-gray-600">
                                                Progress: {tournamentStatus.leagueMatchesCompleted} / {tournamentStatus.leagueMatchesTotal} matches
                                            </p>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div
                                                    className="bg-orange-400 h-2 rounded-full transition-all"
                                                    style={{ width: `${tournamentStatus.leagueMatchesTotal > 0 ? (tournamentStatus.leagueMatchesCompleted / tournamentStatus.leagueMatchesTotal) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 2: Semi Finals */}
                            <div className={`p-4 rounded-xl border-2 ${tournamentStatus.semiFinalComplete ? 'bg-green-50 border-green-200' : tournamentStatus.semiFinalExists ? 'bg-orange-50 border-orange-200' : tournamentStatus.leagueComplete ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${tournamentStatus.semiFinalComplete ? 'bg-green-500 text-white' : tournamentStatus.semiFinalExists ? 'bg-orange-500 text-white' : 'bg-gray-300 text-white'}`}>
                                        {tournamentStatus.semiFinalComplete ? <i className="fas fa-check"></i> : '2'}
                                    </div>
                                    <h4 className="font-bold text-gray-700">Semi Finals</h4>
                                </div>
                                <div className="ml-11">
                                    {tournamentStatus.semiFinalComplete ? (
                                        <div>
                                            <p className="text-green-600 font-bold mb-2">✅ Complete</p>
                                            <div className="bg-white rounded-lg p-3 border">
                                                <p className="text-sm">🏆 SF1 Winner: <strong className="text-green-600">{tournamentStatus.semiFinalResults.sf1Winner}</strong></p>
                                                <p className="text-sm">🏆 SF2 Winner: <strong className="text-green-600">{tournamentStatus.semiFinalResults.sf2Winner}</strong></p>
                                            </div>
                                        </div>
                                    ) : tournamentStatus.semiFinalExists ? (
                                        <p className="text-orange-600">⏳ Waiting for results - Enter results in the Results page</p>
                                    ) : tournamentStatus.leagueComplete ? (
                                        <div>
                                            <p className="text-blue-600 mb-3">Ready to create Semi Finals:</p>

                                            {standingsLoaded && playoffTeams.rank1 ? (
                                                <div className="bg-white rounded-lg p-3 border mb-3">
                                                    <p className="text-xs text-gray-400 mb-1">Proposed Matchups:</p>
                                                    <p className="text-sm">🥇 1st: <strong className="text-uefa-dark">{playoffTeams.rank1}</strong> vs 🥈 2nd: <strong className="text-uefa-dark">{playoffTeams.rank2}</strong></p>
                                                    <p className="text-sm">🥉 3rd: <strong className="text-uefa-dark">{playoffTeams.rank3}</strong> vs 4️⃣ 4th: <strong className="text-uefa-dark">{playoffTeams.rank4}</strong></p>
                                                </div>
                                            ) : (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                                                    <p className="text-sm text-yellow-700 mb-2"><i className="fas fa-exclamation-triangle mr-1"></i> Standings incomplete. Please select teams:</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <select value={playoffTeams.rank1} onChange={e => setPlayoffTeams(p => ({ ...p, rank1: e.target.value }))} className="text-sm border p-1 rounded">
                                                            <option value="">Select 1st</option>
                                                            {teams.map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                        <select value={playoffTeams.rank2} onChange={e => setPlayoffTeams(p => ({ ...p, rank2: e.target.value }))} className="text-sm border p-1 rounded">
                                                            <option value="">Select 2nd</option>
                                                            {teams.map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                        <select value={playoffTeams.rank3} onChange={e => setPlayoffTeams(p => ({ ...p, rank3: e.target.value }))} className="text-sm border p-1 rounded">
                                                            <option value="">Select 3rd</option>
                                                            {teams.map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                        <select value={playoffTeams.rank4} onChange={e => setPlayoffTeams(p => ({ ...p, rank4: e.target.value }))} className="text-sm border p-1 rounded">
                                                            <option value="">Select 4th</option>
                                                            {teams.map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={createSemiFinals}
                                                disabled={savingPlayoffs || !playoffTeams.rank1 || !playoffTeams.rank2 || !playoffTeams.rank3 || !playoffTeams.rank4}
                                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg shadow-lg hover:shadow-orange-500/50 disabled:opacity-50 transition-all"
                                            >
                                                {savingPlayoffs ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plus-circle"></i>}
                                                Create Semi Finals
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400">Complete League Phase first</p>
                                    )}
                                </div>
                            </div>

                            {/* Step 3: Grand Finals */}
                            <div className={`p-4 rounded-xl border-2 ${tournamentStatus.finalsExists ? 'bg-green-50 border-green-200' : tournamentStatus.semiFinalComplete ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${tournamentStatus.finalsExists ? 'bg-green-500 text-white' : tournamentStatus.semiFinalComplete ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-white'}`}>
                                        {tournamentStatus.finalsExists ? <i className="fas fa-check"></i> : '3'}
                                    </div>
                                    <h4 className="font-bold text-gray-700">Grand Finals</h4>
                                </div>
                                <div className="ml-11">
                                    {tournamentStatus.finalsExists ? (
                                        <p className="text-green-600 font-bold">✅ Created - View in Schedule page</p>
                                    ) : tournamentStatus.semiFinalComplete ? (
                                        <div>
                                            <p className="text-yellow-600 mb-3">Ready to create Grand Finals from Semi Finals results:</p>
                                            <div className="bg-white rounded-lg p-3 border mb-3 space-y-2">
                                                <div>
                                                    <p className="text-sm font-bold">🥉 3rd Place Match</p>
                                                    <p className="text-sm ml-4"><strong>{tournamentStatus.semiFinalResults.sf1Loser}</strong> vs <strong>{tournamentStatus.semiFinalResults.sf2Loser}</strong></p>
                                                    <p className="text-xs text-gray-500 ml-4">← Semi Final losers</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">🏆 Grand Final</p>
                                                    <p className="text-sm ml-4"><strong>{tournamentStatus.semiFinalResults.sf1Winner}</strong> vs <strong>{tournamentStatus.semiFinalResults.sf2Winner}</strong></p>
                                                    <p className="text-xs text-gray-500 ml-4">← Semi Final winners</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={createFinalsDay}
                                                disabled={savingPlayoffs}
                                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-lg shadow-lg hover:shadow-yellow-500/50 disabled:opacity-50 transition-all"
                                            >
                                                {savingPlayoffs ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trophy"></i>}
                                                Create Grand Finals
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400">Complete Semi Finals first</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Logo Modal */}
            {logoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in">
                        <div className="bg-gradient-to-r from-cyan-aura to-blue-600 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Manage Logo: {selectedTeam}</h3>
                            <button onClick={() => setLogoModalOpen(false)} className="hover:text-gray-200"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-center items-center gap-6 mb-6">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 mb-2">Current</p>
                                    <TeamLogo teamName={selectedTeam || ''} size="lg" />
                                </div>
                                {logoPreview && (
                                    <>
                                        <i className="fas fa-arrow-right text-gray-300"></i>
                                        <div className="text-center">
                                            <p className="text-xs text-cyan-500 mb-2">New</p>
                                            <img src={logoPreview} className="w-16 h-16 object-contain rounded-lg border" />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setLogoUploadMode('file')}
                                    className={`flex-1 py-1 px-3 rounded text-sm font-bold transition-colors ${logoUploadMode === 'file' ? 'bg-white text-cyan-aura shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    File
                                </button>
                                <button
                                    onClick={() => setLogoUploadMode('url')}
                                    className={`flex-1 py-1 px-3 rounded text-sm font-bold transition-colors ${logoUploadMode === 'url' ? 'bg-white text-cyan-aura shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    URL
                                </button>
                            </div>

                            <div className="mb-6">
                                {logoUploadMode === 'file' ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-aura transition-all cursor-pointer relative bg-gray-50">
                                        <input type="file" accept="image/*" onChange={handleLogoFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <i className="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i>
                                        <p className="text-sm text-gray-600">Click to upload</p>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        className="w-full border p-2 rounded"
                                        placeholder="Image URL"
                                        value={logoUrlInput}
                                        onChange={e => { setLogoUrlInput(e.target.value); setLogoPreview(e.target.value); }}
                                    />
                                )}
                            </div>

                            <button
                                onClick={saveLogo}
                                disabled={uploadingLogo || (!logoFile && !logoUrlInput)}
                                className="w-full py-3 bg-cyan-aura text-white font-bold rounded-lg shadow-lg hover:bg-cyan-600 transition-all"
                            >
                                {uploadingLogo ? 'Saving...' : 'Save Logo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
