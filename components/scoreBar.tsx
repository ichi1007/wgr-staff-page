"use client";

import "@/components/scoreboard.css";
import WGR_Logo from "@/public/img/WGR_Logo_Text.png";
import Image from "next/image";
import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";

interface ScoreBarProps {
  overlayCustomName: string;
  overlayMatchNumber: number;
  initialScores: TeamScore[];
}

interface TeamScore {
  name: string;
  totalPoints: number;
  matchPoint?: boolean;
}

interface PlayerState {
  name: string;
  state: "Alive" | "Down" | "Dead" | "Eliminated" | string;
}
interface TeamState {
  teamName: string;
  players: PlayerState[];
}

const ScoreBar = ({
  overlayCustomName,
  overlayMatchNumber,
  initialScores,
}: ScoreBarProps) => {
  const [teams, setTeams] = useState<TeamScore[]>(initialScores || []);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [teamStates, setTeamStates] = useState<Record<string, PlayerState[]>>(
    {}
  );

  useEffect(() => {
    if (!overlayCustomName) return;

    const fetchScores = async () => {
      try {
        const response = await fetch(
          `/api/scores?customName=${encodeURIComponent(overlayCustomName)}`
        );
        if (!response.ok) {
          console.error("Failed to fetch scores update");
          return;
        }
        const data: TeamScore[] = await response.json();
        setTeams(data);
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    };

    const interval = setInterval(fetchScores, 1000); // 1秒ごとに取得

    return () => clearInterval(interval);
  }, [overlayCustomName]);

  useEffect(() => {
    setTeams(initialScores || []);
  }, [initialScores]);

  useEffect(() => {
    if (teams.length <= 4) {
      setCurrentGroupIndex(0);
      return;
    }

    const numGroups = Math.ceil(teams.length / 4);
    const interval = setInterval(() => {
      setCurrentGroupIndex((prevIndex) => (prevIndex + 1) % numGroups);
    }, 5000); // 5秒ごとにグループを切り替え

    return () => clearInterval(interval);
  }, [teams]);

  // WebSocketでプレイヤー状態を取得
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3100/ws");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // data.players: { [playerName]: { teamName, state, ... } }
        if (data && data.players) {
          const teamMap: Record<string, PlayerState[]> = {};
          Object.values(data.players).forEach((p: any) => {
            if (!teamMap[p.teamName]) teamMap[p.teamName] = [];
            teamMap[p.teamName].push({ name: p.name, state: p.state });
          });
          setTeamStates(teamMap);
        }
      } catch (e) {
        // ignore parse error
      }
    };
    return () => ws.close();
  }, []);

  const teamGroups = [];
  for (let i = 0; i < teams.length; i += 4) {
    teamGroups.push(teams.slice(i, i + 4));
  }

  const currentGroup = teamGroups[currentGroupIndex] || [];
  const startRank = currentGroupIndex * 4 + 1;

  const paddedGroup = [
    ...currentGroup,
    ...Array(Math.max(0, 4 - currentGroup.length)).fill(null),
  ];

  // SVG色判定
  const getPlayerColor = (state: string) => {
    if (state === "Alive") return "#fff";
    if (state === "Down") return "#e00000";
    if (state === "Dead" || state === "Eliminated") return "#00bf63";
    return "#fff";
  };
  const getTeamSvgColor = (teamName: string) => {
    const players = teamStates[teamName];
    if (!players || players.length === 0) return "#fff";
    // 全員死亡またはEliminated
    if (players.every((p) => p.state === "Dead" || p.state === "Eliminated"))
      return "#8a8a8a";
    return null; // 個別色
  };

  return (
    <div className="scorebar">
      <div className="scorebar_body">
        <div className="scorebar_title">
          <Image
            src={WGR_Logo}
            alt="wgr logo"
            className="scorebar_title_logo"
            height={40}
          />
          <p className="scorebar_title_text_title">{overlayCustomName}</p>
          <span className="scorebar_title_text_separator"></span>
          <p className="scorebar_title_text_subtitle">
            MATCH {overlayMatchNumber}
          </p>
        </div>
        <div className="scorebar_content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentGroupIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr",
                alignItems: "center",
                width: "100%",
              }}
            >
              {paddedGroup.map((team, index) => (
                <Fragment key={team ? team.name : `placeholder-${index}`}>
                  <div
                    className={`scorebar_content_item_${index + 1}`}
                    style={{ visibility: team ? "visible" : "hidden" }}
                  >
                    <p
                      className={`scorebar_content_item_${
                        index + 1
                      }_text_order`}
                    >
                      {team ? `${startRank + index}位` : " "}
                    </p>
                    <p
                      className={`scorebar_content_item_${
                        index + 1
                      }_text_point${
                        team && team.matchPoint ? " scorebar_point_yellow" : ""
                      }`}
                    >
                      {team ? `${team.totalPoints}pt` : " "}
                    </p>
                    <p
                      className={`scorebar_content_item_${index + 1}_text_name`}
                    >
                      {team ? team.name : " "}
                    </p>
                    <div className={`scorebar_content_item_${index + 1}_icons`}>
                      {[0, 1, 2].map((iconIdx) => {
                        let svgColor = "#fff";
                        if (team && teamStates[team.name]) {
                          const teamPlayers = teamStates[team.name];
                          // チーム全員がDeadまたはEliminatedなら全員灰色
                          const allDead = teamPlayers.every(
                            (p) => p.state === "Dead" || p.state === "Eliminated"
                          );
                          if (allDead) {
                            svgColor = "#8a8a8a";
                          } else if (teamPlayers[iconIdx]) {
                            // このプレイヤーがEliminatedなら灰色
                            if (teamPlayers[iconIdx].state === "Eliminated") {
                              svgColor = "#8a8a8a";
                            } else {
                              svgColor = getPlayerColor(teamPlayers[iconIdx].state);
                            }
                          }
                        }
                        return (
                          <svg
                            key={iconIdx}
                            width="61"
                            height="41"
                            viewBox="0 0 61 41"
                            xmlns="http://www.w3.org/2000/svg"
                            className={`scorebar_content_item_${
                              index + 1
                            }_icon_${iconIdx + 1}`}
                          >
                            <path
                              d="M0 0H41L61 20.5L41 41H0L18 20.5L0 0Z"
                              fill={svgColor}
                            />
                          </svg>
                        );
                      })}
                    </div>
                  </div>
                  {index < 3 && (
                    <span className="scorebar_content_item_separator"></span>
                  )}
                </Fragment>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ScoreBar;
