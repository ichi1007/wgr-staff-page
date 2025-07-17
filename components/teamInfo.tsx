import "@/components/teamInfo.css";
import Not_Image from "@/public/img/no-image.png"; 
import Image from "next/image";

const TeamInfo = () => {
  return (
    <div className="team_info">
      <div className="team_info_container">
        <div className="team_info_header">
          <h1 className="team_info_header_teamname">
            <span>No.4</span>チーム村上虹郎
          </h1>
          <div className="team_info_header_points">
            <p className="team_info_header_point_rank">
              <span className="team_info_header_point_text">ー 位</span>
            </p>
            <div className="team_info_header_point_separator"></div>
            <p className="team_info_header_point_score">
              <span className="team_info_header_point_text">0</span>
            </p>
          </div>
        </div>
        <div className="team_info_players">
          <div className="team_info_player_1">
            <Image src={Not_Image} alt="" className="team_info_player_1_avatar" />
            <p className="team_info_player_1_name">村上虹郎/senju</p>
          </div>
          <div className="team_info_player_2">
            <Image src={Not_Image} alt="" className="team_info_player_2_avatar" />
            <p className="team_info_player_2_name">BS izzxxv</p>
          </div>
          <div className="team_info_player_3">
            <Image src={Not_Image} alt="" className="team_info_player_3_avatar" />
            <p className="team_info_player_3_name">ばんにた</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamInfo;
