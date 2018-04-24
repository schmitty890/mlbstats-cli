var MLBApi = require('node-mlb-api');
var Table = require('cli-table');
var moment = require('moment');
var inquirer = require('inquirer');

var MLBStats = (function() {

    /**
     * [startInquirer start inquirer and handle questions and answers]
     */
    function startInquirer() {
        inquirer
            .prompt([{
                type: "list",
                message: "What do you want to see?",
                choices: ["Standings", "Boxscores", "Who is playing today"],
                name: "whereTo"
            }]).then(function(resp) {
                var command = resp.whereTo;
                // whereTo switch case
                switch (command) {
                    case 'Who is playing today':
                        whoIsPlaying();
                        break;
                    case 'Boxscores':
                        console.log('boxscores function');
                        fetchBoxScore();
                        break;
                    case 'Standings':
                        console.log('standings... pick al or nl');
                        getStandingsPrompt();
                        break;
                    default:
                        console.log('oh no... default.');
                }

            });
    }

    function fetchBoxScore() {
        MLBApi.getBoxscore(529740).then(function(resp) {
            console.log(resp);
        });
    }

    /**
     * [getStandingsPrompt Prompts the user to choose if they wish to view the NL or AL. This is a requirement from the api]
     */
    function getStandingsPrompt() {
        inquirer
            .prompt([{
                type: "list",
                message: "NL or AL?",
                choices: ["NL", "AL", "Go Back Home"],
                name: "league"
            }, {
                type: "list",
                message: "Which year?",
                choices: ['2018', '2017', '2016', '2015', '2014', '2013'],
                name: "year"
            }]).then(function(resp) {
                var league = resp.league;
                var year = resp.year;
                // whereTo switch case
                switch (league) {
                    case 'AL':
                    case 'NL':
                        fetchStandings(league, year);
                        break;
                    case 'Go Back Home':
                        startInquirer();
                        break;
                    default:
                        console.log('oh no... default.');
                }

            });
    }

    /**
     * [fetchStandings logs out the standings of the AL or the NL]
     */
    function fetchStandings(league, year) {
        MLBApi.getStandings(league, year)
            .then(function(resp) {
                console.log(resp);
            });
    }


    function whoIsPlaying() {
        var games = MLBApi.getGames();
        // console.log(games);
        games.then(function(resp) {
            // console.log(resp);
            // console.log(resp['dates'][0].events);
            var respGames = resp['dates'][0].games;
            console.log(respGames);
            var gamesInProgress = resp.totalGamesInProgress;
            // initialize table
            var table = new Table({
                head: ['Game ID', 'Game Date', 'Stadium', 'Home Team', 'Away Team'],
                colWidths: [20, 20, 20, 20, 20]
            });

            respGames.forEach(function(game) {
                // console.log(element);
                var gameDate = moment(game.gameDate.substring(0, 10), "YYYYMMDD").fromNow(),
                    gameID = game.gamePk,
                    venue = game.venue.name,
                    teams = game.teams,
                    homeTeam = teams.home.team.name,
                    awayTeam = teams.away.team.name,
                    homeTeamWins = teams.home.leagueRecord.wins,
                    homeTeamLosses = teams.home.leagueRecord.losses,
                    homeTeamPercentage = teams.home.leagueRecord.pct,
                    awayTeamWins = teams.away.leagueRecord.wins,
                    awayTeamLosses = teams.away.leagueRecord.losses,
                    awayTeamPercentage = teams.away.leagueRecord.pct;
                // construct data obj
                var data = {
                    id: gameID,
                    date: gameDate,
                    venue: venue,
                    homeTeam: homeTeam,
                    awayTeam: awayTeam
                };
                // push data to table
                table.push(
                    [data.id, data.date, data.venue, data.homeTeam, data.awayTeam]
                );
            });
            // print table
            console.log(table.toString());
        });
    }

    /**
     * [init functions to start]
     */
    function init() {
        startInquirer();
    }

    return {
        init: init
    }
})();

MLBStats.init();