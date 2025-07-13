import { NextRequest, NextResponse } from "next/server";
import { google, sheets_v4 } from "googleapis"; // sheets_v4 をインポート

export async function POST(request: NextRequest) {
  try {
    const { spreadsheetId, totalResults, matches } = await request.json();

    // サービスアカウントの認証
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"], // Sheets scope needed for reading/writing sheet properties and values
    });

    const sheets = google.sheets({ version: "v4", auth });

    // スプレッドシートの既存シート情報を取得
    let existingSheets;
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "sheets(properties,bandedRanges)", // Get sheet properties and bandedRanges
      });
      existingSheets = spreadsheet.data.sheets || [];
    } catch (getSheetError: any) {
      console.error(
        "Error fetching spreadsheet details:",
        getSheetError.response?.data || getSheetError
      );
      throw new Error(
        "Failed to get spreadsheet details: " +
          (getSheetError.response?.data?.error?.message ||
            getSheetError.message)
      );
    }

    // --- Handle "Total Result" sheet ---
    const totalResultSheetName = "Total Result";
    const totalResultSheet = existingSheets.find(
      (sheet) => sheet.properties?.title === totalResultSheetName
    );
    const defaultSheet = existingSheets.find(
      (sheet) => sheet.properties?.sheetId === 0
    );

    if (!totalResultSheet) {
      // "Total Result" sheet does not exist
      if (
        defaultSheet &&
        defaultSheet.properties?.title !== totalResultSheetName
      ) {
        // Default sheet exists and has a different name, rename it
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [
                {
                  updateSheetProperties: {
                    properties: {
                      sheetId: 0, // Default sheet ID
                      title: totalResultSheetName,
                    },
                    fields: "title", // Specify that we are updating the title
                  },
                },
              ],
            },
          });
          console.log(
            `Renamed default sheet (ID 0) to "${totalResultSheetName}"`
          );
        } catch (renameError: any) {
          console.error(
            "Error renaming default sheet:",
            renameError.response?.data || renameError
          );
          throw new Error(
            `Failed to rename default sheet to "${totalResultSheetName}": ` +
              (renameError.response?.data?.error?.message ||
                renameError.message)
          );
        }
      } else if (!defaultSheet) {
        // Default sheet (ID 0) not found - unexpected for a new sheet
        console.error(
          "Default sheet (ID 0) not found in spreadsheet:",
          spreadsheetId
        );
        // Attempt to add a new sheet named "Total Result" as a fallback, though this is less common
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: totalResultSheetName,
                    },
                  },
                },
              ],
            },
          });
          console.log(
            `Added new sheet named "${totalResultSheetName}" as default sheet (ID 0) was not found.`
          );
        } catch (addSheetError: any) {
          console.error(
            "Error adding fallback 'Total Result' sheet:",
            addSheetError.response?.data || addSheetError
          );
          throw new Error(
            `Failed to add "${totalResultSheetName}" sheet: ` +
              (addSheetError.response?.data?.error?.message ||
                addSheetError.message)
          );
        }
      }
      // If defaultSheet exists and its title is already "Total Result", no action needed.
    }
    // --- End: Handle "Total Result" sheet ---

    // 再度スプレッドシート情報を取得して、"Total Result"シートのIDを確実に入手
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties(sheetId,title)",
    });
    const totalResultSheetForFormatting = spreadsheetInfo.data.sheets?.find(
      (s) => s.properties?.title === totalResultSheetName
    );
    const totalResultSheetId =
      totalResultSheetForFormatting?.properties?.sheetId;

    if (totalResultSheetId === undefined) {
      // このエラーは基本的には発生しないはず
      throw new Error(`Could not find sheetId for "${totalResultSheetName}"`);
    }

    // --- Player Stats Calculation ---
    const playerStats = new Map<
      string,
      { playerName: string; totalKills: number; totalDamage: number }
    >();

    matches.forEach((match: any) => {
      // teamResultではなく、playerResultから集計する
      if (match.playerResult) {
        match.playerResult.forEach((player: any) => {
          const existingPlayer = playerStats.get(player.playerName);
          if (existingPlayer) {
            existingPlayer.totalKills += player.kill;
            existingPlayer.totalDamage += player.damage;
          } else {
            playerStats.set(player.playerName, {
              playerName: player.playerName,
              totalKills: player.kill,
              totalDamage: player.damage,
            });
          }
        });
      } else if (match.player_results) {
        // フォールバック
        match.player_results.forEach((player: any) => {
          const existingPlayer = playerStats.get(player.playerName);
          if (existingPlayer) {
            existingPlayer.totalKills += player.kills;
            existingPlayer.totalDamage += player.damageDealt;
          } else {
            playerStats.set(player.playerName, {
              playerName: player.playerName,
              totalKills: player.kills,
              totalDamage: player.damageDealt,
            });
          }
        });
      }
    });

    const statsArray = Array.from(playerStats.values());

    // Top 5 Kills
    const top5Kills = statsArray
      .sort((a, b) => b.totalKills - a.totalKills)
      .slice(0, 5);
    while (top5Kills.length < 5) {
      top5Kills.push({ playerName: "", totalKills: 0, totalDamage: 0 });
    }

    // Top 5 Damage
    const top5Damage = statsArray
      .sort((a, b) => b.totalDamage - a.totalDamage)
      .slice(0, 5);
    while (top5Damage.length < 5) {
      top5Damage.push({ playerName: "", totalDamage: 0, totalKills: 0 });
    }

    // --- Prepare Data for Sheet ---
    // Total Resultシートにデータを書き込み
    const totalData = [
      // 以下のヘッダー行を画像に合わせて変更
      // ["順位", "チーム名", "PP", "KP", "ALL", "マッチ数"],
      ["順位", "チーム名", "順位ポイント", "キルポイント", "合計ポイント"],
      ...totalResults.map((team: any, index: number) => [
        index + 1,
        team.name,
        team.totalPlacementPoint, // 順位ポイント
        team.totalKillPoint, // キルポイント
        team.totalAllPoint, // 合計ポイント
        // 画像に「マッチ数」の列がないため削除
        // team.matchCount,
      ]),
    ];

    // Kill ranking table data
    const killTop5Data = [
      ["キル数TOP5"],
      // 以下のヘッダー行に「順位」を追加
      ["順位", "選手名", "キル", "ダメージ"],
      ...top5Kills.map((p, i) => [
        i + 1,
        p.playerName,
        p.totalKills,
        p.totalDamage,
      ]),
    ];

    // Damage ranking table data
    const damageTop5Data = [
      ["ダメージ数TOP5"],
      // 以下のヘッダー行に「順位」を追加
      ["順位", "選手名", "ダメージ", "キル"],
      ...top5Damage.map((p, i) => [
        i + 1,
        p.playerName,
        p.totalDamage,
        p.totalKills,
      ]),
    ];

    try {
      // 1. データを書き込む
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: "RAW",
          data: [
            {
              range: `${totalResultSheetName}!A1`,
              values: totalData,
            },
            {
              range: `${totalResultSheetName}!G1`,
              values: killTop5Data,
            },
            {
              range: `${totalResultSheetName}!G10`,
              values: damageTop5Data,
            },
          ],
        },
      });
      console.log(`Data written to "${totalResultSheetName}" sheet.`);

      // --- Find existing banding to delete it first ---
      const sheetWithBanding = existingSheets.find(
        (s) => s.properties?.sheetId === totalResultSheetId
      );
      const deleteBandingRequests = (sheetWithBanding?.bandedRanges || []).map(
        (br) => ({
          deleteBanding: {
            bandedRangeId: br.bandedRangeId,
          },
        })
      );

      // 2. デザインを適用するためのリクエストを作成
      const formattingRequests: sheets_v4.Schema$Request[] = [
        ...deleteBandingRequests,
        // Header Style (A1:E1)
        {
          repeatCell: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 5, // A-E列
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 0.23,
                  green: 0.23,
                  blue: 0.23,
                }, // Dark Gray
                horizontalAlignment: "CENTER",
                textFormat: {
                  foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 }, // White
                  bold: true,
                  fontSize: 11,
                },
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
          },
        },
        // Data cells background color -> Alternating row colors (Banding) for Total Result Table (A:E)
        {
          addBanding: {
            bandedRange: {
              range: {
                sheetId: totalResultSheetId,
                startRowIndex: 0, // ヘッダー行から範囲を開始
                endRowIndex: totalResults.length + 1, // 最終データ行まで
                startColumnIndex: 0,
                endColumnIndex: 5,
              },
              rowProperties: {
                headerColor: {
                  red: 0.23,
                  green: 0.23,
                  blue: 0.23,
                }, // ヘッダーの色 (repeatCellで上書きされるが設定)
                firstBandColor: {
                  red: 1.0,
                  green: 1.0,
                  blue: 1.0,
                }, // 奇数データ行は白
                secondBandColor: {
                  red: 0.95,
                  green: 0.95,
                  blue: 0.95,
                }, // 偶数データ行は薄いグレー
              },
            },
          },
        },
        // Column Widths
        {
          updateDimensionProperties: {
            range: {
              sheetId: totalResultSheetId,
              dimension: "COLUMNS",
              startIndex: 0, // A列
              endIndex: 1,
            },
            properties: { pixelSize: 60 },
            fields: "pixelSize",
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: totalResultSheetId,
              dimension: "COLUMNS",
              startIndex: 1, // B列
              endIndex: 2,
            },
            properties: { pixelSize: 250 },
            fields: "pixelSize",
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: totalResultSheetId,
              dimension: "COLUMNS",
              startIndex: 2, // C-E列
              endIndex: 5,
            },
            properties: { pixelSize: 120 },
            fields: "pixelSize",
          },
        },
        // Borders for the whole table (A:E)
        {
          updateBorders: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 0,
              endRowIndex: totalResults.length + 1,
              startColumnIndex: 0,
              endColumnIndex: 5,
            },
            top: { style: "SOLID", width: 1 },
            bottom: { style: "SOLID", width: 1 },
            left: { style: "SOLID", width: 1 },
            right: { style: "SOLID", width: 1 },
            innerHorizontal: {
              style: "SOLID",
              width: 1,
              color: { red: 0.0, green: 0.0, blue: 0.0 }, // White grid lines -> Black
            },
            innerVertical: {
              style: "SOLID",
              width: 1,
              color: { red: 0.0, green: 0.0, blue: 0.0 }, // White grid lines -> Black
            },
          },
        },
        // Center align numeric columns (A, C, D, E)
        {
          repeatCell: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 1, // 2行目から
              endRowIndex: totalResults.length + 1,
              startColumnIndex: 0, // A列
              endColumnIndex: 1,
            },
            cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
            fields: "userEnteredFormat.horizontalAlignment",
          },
        },
        {
          repeatCell: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 1, // 2行目から
              endRowIndex: totalResults.length + 1,
              startColumnIndex: 2, // C列からE列
              endColumnIndex: 5,
            },
            cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
            fields: "userEnteredFormat.horizontalAlignment",
          },
        },
        // --- Formatting for Kill Ranking Table (G1:J7) ---
        {
          mergeCells: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 6,
              endColumnIndex: 10,
            }, // G1:J1 (4列結合)
            mergeType: "MERGE_ALL",
          },
        },
        {
          repeatCell: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 6,
              endColumnIndex: 7, // G1
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
                horizontalAlignment: "CENTER",
              },
            },
            fields: "userEnteredFormat(textFormat,horizontalAlignment)",
          },
        },
        {
          repeatCell: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 1,
              endRowIndex: 2,
              startColumnIndex: 6, // G2から開始
              endColumnIndex: 10, // J2まで
            }, // G2:J2
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.23, green: 0.23, blue: 0.23 },
                horizontalAlignment: "CENTER",
                textFormat: {
                  foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                  bold: true,
                  fontSize: 11,
                },
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
          },
        },
        // Add Banding for Kill Ranking Data (G3:J7) - Range is correct
        {
          addBanding: {
            bandedRange: {
              range: {
                sheetId: totalResultSheetId,
                startRowIndex: 2, // データは3行目 (インデックス2) から開始
                endRowIndex: 7, // 7行目 (インデックス6) まで
                startColumnIndex: 6, // G列 (インデックス6)
                endColumnIndex: 10, // J列 (インデックス9)
              },
              rowProperties: {
                firstBandColor: { red: 1.0, green: 1.0, blue: 1.0 }, // 白
                secondBandColor: { red: 0.95, green: 0.95, blue: 0.95 }, // 薄いグレー
              },
            },
          },
        },
        // Borders for Kill Ranking Table (G2:J7) - Range is correct
        {
          updateBorders: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 1, // 2行目から
              endRowIndex: 7, // 7行目まで
              startColumnIndex: 6, // G列から
              endColumnIndex: 10, // J列まで
            }, // G2:J7
            top: { style: "SOLID", width: 1 },
            bottom: { style: "SOLID", width: 1 },
            left: { style: "SOLID", width: 1 },
            right: { style: "SOLID", width: 1 },
            innerHorizontal: { style: "SOLID", width: 1 },
            innerVertical: { style: "SOLID", width: 1 }, // Add inner vertical border
          },
        },
        // Alignments for Kill Ranking Data (G3:J7)
        {
          repeatCell: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 2, // 3行目から
              endRowIndex: 7, // 7行目まで
              startColumnIndex: 6, // G列 (順位)
              endColumnIndex: 7, // H列の手前
            },
            cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
            fields: "userEnteredFormat.horizontalAlignment",
          },
        },
        {
          repeatCell: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 2, // 3行目から
              endRowIndex: 7, // 7行目まで
              startColumnIndex: 7, // H列 (選手名)
              endColumnIndex: 8, // I列の手前
            },
            cell: { userEnteredFormat: { horizontalAlignment: "LEFT" } },
            fields: "userEnteredFormat.horizontalAlignment",
          },
        },
        {
          repeatCell: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 2, // 3行目から
              endRowIndex: 7, // 7行目まで
              startColumnIndex: 8, // I列 (キル)
              endColumnIndex: 10, // K列の手前 (J列まで)
            },
            cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
            fields: "userEnteredFormat.horizontalAlignment",
          },
        },
        // --- Formatting for Damage Ranking Table (G10:J16) ---
        {
          mergeCells: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 9,
              endRowIndex: 10,
              startColumnIndex: 6,
              endColumnIndex: 10,
            }, // G10:J10 (4列結合)
            mergeType: "MERGE_ALL",
          },
        },
        {
          repeatCell: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 9,
              endRowIndex: 10,
              startColumnIndex: 6,
              endColumnIndex: 7, // G10
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
                horizontalAlignment: "CENTER",
              },
            },
            fields: "userEnteredFormat(textFormat,horizontalAlignment)",
          },
        },
        {
          repeatCell: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 10,
              endRowIndex: 11,
              startColumnIndex: 6, // G11から開始
              endColumnIndex: 10, // J11まで
            }, // G11:J11
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.23, green: 0.23, blue: 0.23 },
                horizontalAlignment: "CENTER",
                textFormat: {
                  foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                  bold: true,
                  fontSize: 11,
                },
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
          },
        },
        // Add Banding for Damage Ranking Data (G12:J16) - Range is correct
        {
          addBanding: {
            bandedRange: {
              range: {
                sheetId: totalResultSheetId,
                startRowIndex: 11, // データは12行目 (インデックス11) から開始
                endRowIndex: 16, // 16行目 (インデックス15) まで
                startColumnIndex: 6, // G列 (インデックス6)
                endColumnIndex: 10, // J列 (インデックス9)
              },
              rowProperties: {
                firstBandColor: { red: 1.0, green: 1.0, blue: 1.0 }, // 白
                secondBandColor: { red: 0.95, green: 0.95, blue: 0.95 }, // 薄いグレー
              },
            },
          },
        },
        // Borders for Damage Ranking Table (G11:J16) - Range is correct
        {
          updateBorders: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 10, // 11行目から
              endRowIndex: 16, // 16行目まで
              startColumnIndex: 6, // G列から
              endColumnIndex: 10, // J列まで
            }, // G11:J16
            top: { style: "SOLID", width: 1 },
            bottom: { style: "SOLID", width: 1 },
            left: { style: "SOLID", width: 1 },
            right: { style: "SOLID", width: 1 },
            innerHorizontal: { style: "SOLID", width: 1 },
            innerVertical: { style: "SOLID", width: 1 }, // Add inner vertical border
          },
        },
        // Alignments for Damage Ranking Data (G12:J16)
        {
          repeatCell: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 11, // 12行目から
              endRowIndex: 16, // 16行目まで
              startColumnIndex: 6, // G列 (順位)
              endColumnIndex: 7, // H列の手前
            },
            cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
            fields: "userEnteredFormat.horizontalAlignment",
          },
        },
        {
          repeatCell: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 11, // 12行目から
              endRowIndex: 16, // 16行目まで
              startColumnIndex: 7, // H列 (選手名)
              endColumnIndex: 8, // I列の手前
            },
            cell: { userEnteredFormat: { horizontalAlignment: "LEFT" } },
            fields: "userEnteredFormat.horizontalAlignment",
          },
        },
        {
          repeatCell: {
            range: {
              sheetId: totalResultSheetId,
              startRowIndex: 11, // 12行目から
              endRowIndex: 16, // 16行目まで
              startColumnIndex: 8, // I列 (ダメージ)
              endColumnIndex: 10, // K列の手前 (J列まで)
            },
            cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
            fields: "userEnteredFormat.horizontalAlignment",
          },
        },
        // --- Column Widths for G:J ---
        {
          updateDimensionProperties: {
            range: {
              sheetId: totalResultSheetId,
              dimension: "COLUMNS",
              startIndex: 6, // G列 (順位)
              endIndex: 7, // H列の手前
            },
            properties: { pixelSize: 60 },
            fields: "pixelSize",
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: totalResultSheetId,
              dimension: "COLUMNS",
              startIndex: 7, // H列 (選手名)
              endIndex: 8, // I列の手前
            },
            properties: { pixelSize: 200 },
            fields: "pixelSize",
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: totalResultSheetId,
              dimension: "COLUMNS",
              startIndex: 8, // I列 (キル/ダメージ)
              endIndex: 10, // K列の手前 (J列まで)
            },
            properties: { pixelSize: 100 },
            fields: "pixelSize",
          },
        },
      ];

      // --- Add Conditional Formatting for Total Result ALL column (E) ---
      totalResults.forEach((team: any, index: number) => {
        const rowNumber = index + 2; // Data starts from row 2 (index 1)
        const cellRange = {
          sheetId: totalResultSheetId,
          startRowIndex: rowNumber - 1, // 0-indexed start row
          endRowIndex: rowNumber, // 0-indexed end row (exclusive)
          startColumnIndex: 4, // E column (index 4)
          endColumnIndex: 5, // F column (index 5, exclusive)
        };

        let foregroundColor = null;
        if (team.isOverallWinner) {
          // Winner is red
          foregroundColor = { red: 1.0, green: 0.0, blue: 0.0 };
        } else if (team.isMatchPoint) {
          // Match Point is yellow (#f0b100)
          foregroundColor = { red: 0.941, green: 0.694, blue: 0.0 }; // #f0b100 に対応するRGB値
        }

        if (foregroundColor) {
          formattingRequests.push({
            repeatCell: {
              range: cellRange,
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    foregroundColor: foregroundColor,
                    bold: true, // Bold text for colored points
                  },
                },
              },
              fields:
                "userEnteredFormat.textFormat.foregroundColor,userEnteredFormat.textFormat.bold",
            },
          });
        }
      });
      // --- End Conditional Formatting ---

      // 3. batchUpdateでフォーマットを適用
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: formattingRequests,
        },
      });
      console.log(`Formatting applied to "${totalResultSheetName}" sheet.`);
    } catch (writeTotalError: any) {
      console.error(
        `Error writing or formatting "${totalResultSheetName}" sheet:`,
        writeTotalError.response?.data || writeTotalError
      );
      throw new Error(
        `Failed to write or format data to "${totalResultSheetName}" sheet: ` +
          (writeTotalError.response?.data?.error?.message ||
            writeTotalError.message)
      );
    }

    // 各マッチごとにシートを作成または更新してデータを書き込み
    const addSheetRequests = [];
    for (let i = 0; i < matches.length; i++) {
      const matchSheetName = `Match ${i + 1}`;
      const existingMatchSheet = existingSheets.find(
        (sheet) => sheet.properties?.title === matchSheetName
      );
      if (!existingMatchSheet) {
        addSheetRequests.push({
          addSheet: {
            properties: {
              title: matchSheetName,
            },
          },
        });
      }
    }

    if (addSheetRequests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: addSheetRequests,
        },
      });
      console.log(`Added ${addSheetRequests.length} new match sheets.`);
      // Re-fetch sheets to get IDs of newly created ones
      const updatedSpreadsheet = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "sheets(properties,bandedRanges)",
      });
      existingSheets = updatedSpreadsheet.data.sheets || [];
    }

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const matchSheetName = `Match ${i + 1}`;
      const matchSheet = existingSheets.find(
        (s) => s.properties?.title === matchSheetName
      );
      const matchSheetId = matchSheet?.properties?.sheetId;

      if (matchSheetId === undefined) {
        console.error(
          `Could not find sheetId for "${matchSheetName}", skipping.`
        );
        continue;
      }

      // --- Prepare Team Data for Match Sheet ---
      const teamResults = match.teamResult || [];
      teamResults.sort((a: any, b: any) => a.placement - b.placement);
      const teamResultData = [
        ["順位", "チーム名", "順位ポイント", "キルポイント", "合計ポイント"],
        ...teamResults.map((team: any) => [
          team.placement,
          team.name,
          team.placementPoint,
          team.killPoint,
          team.allPoint,
        ]),
      ];

      // --- Prepare Player Data for Match Sheet ---
      const playerResults = match.playerResult || match.player_results || [];
      playerResults.sort((a: any, b: any) => {
        if (a.teamPlacement !== b.teamPlacement) {
          return a.teamPlacement - b.teamPlacement;
        }
        return (a.playerName || "").localeCompare(b.playerName || "");
      });

      const playerResultData = [
        [
          "順位",
          "チーム名",
          "プレイヤー名",
          "キャラクター",
          "キル",
          "アシスト",
          "ダメージ",
          "ショット数",
          "ヒット数",
          "命中率(%)",
        ],
        ...playerResults.map((player: any) => {
          const shots = player.shots ?? 0;
          const hits = player.hits ?? 0;
          const accuracy =
            shots > 0 ? ((hits / shots) * 100).toFixed(1) : "0.0";
          return [
            player.teamPlacement,
            player.teamName,
            player.playerName,
            player.characterName,
            player.kill ?? player.kills ?? 0,
            player.assists ?? 0,
            player.damage ?? player.damageDealt ?? 0,
            shots,
            hits,
            accuracy,
          ];
        }),
      ];

      // --- Prepare Champion Squad Characters Data ---
      const winningTeamResult = teamResults.find(
        (team: any) => team.winner === true
      );
      const firstPlaceTeamResult = teamResults.find(
        (team: any) => team.placement === 1
      );
      const teamToDisplayCharacters = winningTeamResult || firstPlaceTeamResult;

      let championSquadPlayers: any[] = [];
      if (teamToDisplayCharacters) {
        championSquadPlayers = (
          match.playerResult ||
          match.player_results ||
          []
        ).filter(
          (player: any) => player.teamName === teamToDisplayCharacters.name
        );
        // Sort players within the team if needed (e.g., by kills, though not requested)
        // championSquadPlayers.sort((a, b) => b.kill - a.kill);
      }

      const championCharactersData = [
        ["チャンピオン部隊のキャラクター"], // A23
        ["プレイヤー名", "キャラクター"], // A24, B24
        ...championSquadPlayers.map((player) => [
          player.playerName,
          player.characterName,
        ]),
      ];
      // --- End Prepare Champion Squad Characters Data ---

      // --- Prepare Most Used Characters Data ---
      const characterCounts = new Map<string, number>();
      (match.playerResult || match.player_results || []).forEach(
        (player: any) => {
          const charName = player.characterName || "Unknown";
          characterCounts.set(
            charName,
            (characterCounts.get(charName) || 0) + 1
          );
        }
      );

      const sortedCharacters = Array.from(characterCounts.entries())
        .map(([characterName, count]) => ({ characterName, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Get top 5

      // Ensure there are always 5 rows, even if less than 5 unique characters
      while (sortedCharacters.length < 5) {
        sortedCharacters.push({ characterName: "", count: 0 });
      }

      const mostUsedCharactersData = [
        ["最も使用されたキャラクター TOP5"], // A29
        ["キャラクター", "ピック人数"], // A30, B30
        ...sortedCharacters.map((char) => [char.characterName, char.count]),
      ];
      // --- End Prepare Most Used Characters Data ---

      try {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: {
            valueInputOption: "RAW",
            data: [
              {
                range: `${matchSheetName}!A1`,
                values: teamResultData,
              },
              {
                range: `${matchSheetName}!G1`, // プレイヤーリザルトの開始位置をG1に変更
                values: playerResultData,
              },
              {
                range: `${matchSheetName}!A23`, // チャンピオン部隊キャラクターテーブルの開始位置
                values: championCharactersData,
              },
              {
                range: `${matchSheetName}!A29`, // 最も使用されたキャラクターテーブルの開始位置
                values: mostUsedCharactersData,
              },
            ],
          },
        });
        console.log(`Data written to "${matchSheetName}" sheet.`);

        const deleteMatchBandingRequests = (matchSheet?.bandedRanges || []).map(
          (br: any) => ({
            deleteBanding: {
              bandedRangeId: br.bandedRangeId,
            },
          })
        );

        // 明示的に型を指定
        const matchFormattingRequests: sheets_v4.Schema$Request[] = [
          ...deleteMatchBandingRequests,
          // === Team Result Table Formatting (A1:E...) ===
          {
            repeatCell: {
              range: {
                sheetId: matchSheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 5,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.23, green: 0.23, blue: 0.23 },
                  horizontalAlignment: "CENTER",
                  textFormat: {
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                    bold: true,
                    fontSize: 11,
                  },
                },
              },
              fields:
                "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
            },
          },
          {
            addBanding: {
              bandedRange: {
                range: {
                  sheetId: matchSheetId,
                  startRowIndex: 0,
                  endRowIndex: teamResults.length + 1,
                  startColumnIndex: 0,
                  endColumnIndex: 5,
                },
                rowProperties: {
                  headerColor: { red: 0.23, green: 0.23, blue: 0.23 },
                  firstBandColor: { red: 1.0, green: 1.0, blue: 1.0 },
                  secondBandColor: { red: 0.95, green: 0.95, blue: 0.95 },
                },
              },
            },
          },
          {
            updateBorders: {
              range: {
                sheetId: matchSheetId,
                startRowIndex: 0,
                endRowIndex: teamResults.length + 1,
                startColumnIndex: 0,
                endColumnIndex: 5,
              },
              top: { style: "SOLID", width: 1 },
              bottom: { style: "SOLID", width: 1 },
              left: { style: "SOLID", width: 1 },
              right: { style: "SOLID", width: 1 },
              innerHorizontal: {
                // 内側の水平線
                style: "SOLID",
                width: 1,
                color: { red: 1.0, green: 1.0, blue: 1.0 },
              },
              innerVertical: { style: "SOLID", width: 1 }, // 内側の垂直線
            },
          },
          {
            repeatCell: {
              range: {
                sheetId: matchSheetId,
                startRowIndex: 1,
                endRowIndex: teamResults.length + 1,
                startColumnIndex: 0,
                endColumnIndex: 5,
              },
              cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
              fields: "userEnteredFormat.horizontalAlignment",
            },
          },
          {
            repeatCell: {
              range: {
                sheetId: matchSheetId,
                startRowIndex: 1,
                endRowIndex: teamResults.length + 1,
                startColumnIndex: 1,
                endColumnIndex: 2,
              },
              cell: { userEnteredFormat: { horizontalAlignment: "LEFT" } },
              fields: "userEnteredFormat.horizontalAlignment",
            },
          },

          // === Player Result Table Formatting (G1:P...) === // 開始位置をGに変更
          {
            repeatCell: {
              range: {
                sheetId: matchSheetId, // プレイヤーリザルトのヘッダー行は1行目 (インデックス0)
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 6, // G列から開始 (インデックス6)
                endColumnIndex: 16, // G列から10列 (G-P) なのでインデックス6から16
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.23, green: 0.23, blue: 0.23 },
                  horizontalAlignment: "CENTER",
                  textFormat: {
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                    bold: true,
                    fontSize: 11,
                  },
                },
              },
              fields:
                "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
            },
          },
          {
            updateBorders: {
              range: {
                sheetId: matchSheetId, // ヘッダー行から範囲を開始
                startRowIndex: 0,
                endRowIndex: playerResults.length + 1, // 最終データ行まで
                startColumnIndex: 6, // G列から開始
                endColumnIndex: 16, // P列まで
              },
              top: { style: "SOLID", width: 1 },
              bottom: { style: "SOLID", width: 1 },
              left: { style: "SOLID", width: 1 },
              right: { style: "SOLID", width: 1 },
              innerHorizontal: {
                // 内側の水平線
                style: "SOLID",
                width: 1,
                color: { red: 1.0, green: 1.0, blue: 1.0 },
              },
              innerVertical: { style: "SOLID", width: 1 }, // 内側の垂直線
            },
          },
          // Column Widths for Player Result Table (G:P)
          {
            updateDimensionProperties: {
              range: {
                sheetId: matchSheetId,
                dimension: "COLUMNS",
                startIndex: 6, // G列
                endIndex: 7, // H列の手前
              },
              properties: { pixelSize: 50 },
              fields: "pixelSize",
            },
          }, // 順位 (G)
          {
            updateDimensionProperties: {
              range: {
                sheetId: matchSheetId,
                dimension: "COLUMNS",
                startIndex: 7, // H列
                endIndex: 9, // J列の手前
              },
              properties: { pixelSize: 160 },
              fields: "pixelSize",
            },
          }, // チーム名 (H), プレイヤー名 (I)
          {
            updateDimensionProperties: {
              range: {
                sheetId: matchSheetId,
                dimension: "COLUMNS",
                startIndex: 9, // J列
                endIndex: 10, // K列の手前
              },
              properties: { pixelSize: 100 },
              fields: "pixelSize",
            },
          }, // キャラクター (J)
          {
            updateDimensionProperties: {
              range: {
                sheetId: matchSheetId,
                dimension: "COLUMNS",
                startIndex: 10, // K列
                endIndex: 15, // P列の手前
              },
              properties: { pixelSize: 80 },
              fields: "pixelSize",
            },
          }, // キル (K) to ヒット数 (O)
          {
            updateDimensionProperties: {
              range: {
                sheetId: matchSheetId,
                dimension: "COLUMNS",
                startIndex: 15, // P列
                endIndex: 16, // Q列の手前
              },
              properties: { pixelSize: 90 },
              fields: "pixelSize",
            },
          }, // 命中率 (P)
          // Alignments for Player Result Table (G:P)
          {
            repeatCell: {
              range: {
                sheetId: matchSheetId, // 2行目から
                startRowIndex: 1,
                endRowIndex: playerResults.length + 1,
                startColumnIndex: 6, // G列
                endColumnIndex: 7, // H列の手前
              },
              cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
              fields: "userEnteredFormat.horizontalAlignment",
            },
          }, // 順位 (G)
          {
            repeatCell: {
              range: {
                sheetId: matchSheetId, // 2行目から
                startRowIndex: 1,
                endRowIndex: playerResults.length + 1,
                startColumnIndex: 7, // H列
                endColumnIndex: 10, // K列の手前
              },
              cell: { userEnteredFormat: { horizontalAlignment: "LEFT" } },
              fields: "userEnteredFormat.horizontalAlignment",
            },
          }, // チーム名 (H), プレイヤー名 (I), キャラクター (J)
          {
            repeatCell: {
              range: {
                sheetId: matchSheetId, // 2行目から
                startRowIndex: 1,
                endRowIndex: playerResults.length + 1,
                startColumnIndex: 10, // K列
                endColumnIndex: 16, // Q列の手前
              },
              cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
              fields: "userEnteredFormat.horizontalAlignment",
            },
          }, // Stats (K-P)
        ];

        // Add dynamic repeatCell requests for player table background (team-based banding)
        const colors = [
          { red: 1.0, green: 1.0, blue: 1.0 }, // White
          { red: 0.95, green: 0.95, blue: 0.95 }, // Light Gray
        ];
        let startRowIndex = 1; // Data starts from the second row (index 1)
        let currentColorIndex = 0;

        for (let j = 0; j < playerResults.length; j++) {
          const player = playerResults[j];
          const nextPlayer = playerResults[j + 1];
          const teamChanged = nextPlayer
            ? player.teamName !== nextPlayer.teamName
            : true; // Team changes at the last player or when name differs

          if (teamChanged) {
            // Add repeatCell request for the current team block
            matchFormattingRequests.push({
              repeatCell: {
                range: {
                  sheetId: matchSheetId,
                  startRowIndex: startRowIndex,
                  endRowIndex: j + 2, // j is 0-indexed, rows are 1-indexed, data starts at row 2 (index 1)
                  startColumnIndex: 6, // G column
                  endColumnIndex: 16, // P column
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: colors[currentColorIndex],
                  },
                },
                fields: "userEnteredFormat.backgroundColor",
              },
            });

            // Prepare for the next team block
            startRowIndex = j + 2;
            currentColorIndex = 1 - currentColorIndex; // Switch color
          }
        }

        // --- Add Formatting for Champion Squad Characters Table (A23:B...) ---
        const championTableStartRowIndex = 22; // A23 is 0-indexed row 22
        const championTableEndRowIndex =
          championTableStartRowIndex + championCharactersData.length; // Exclusive

        if (championCharactersData.length > 1) {
          // Only format if there's data beyond the header
          // Merge Header Cell (A23:B23)
          matchFormattingRequests.push({
            mergeCells: {
              range: {
                sheetId: matchSheetId,
                startRowIndex: championTableStartRowIndex,
                endRowIndex: championTableStartRowIndex + 1, // Merge A23:B23
                startColumnIndex: 0,
                endColumnIndex: 2,
              },
              mergeType: "MERGE_ALL",
            },
          });

          // Style Header (A23)
          matchFormattingRequests.push({
            repeatCell: {
              range: {
                sheetId: matchSheetId,
                startRowIndex: championTableStartRowIndex,
                endRowIndex: championTableStartRowIndex + 1,
                startColumnIndex: 0,
                endColumnIndex: 1, // Target A23 (merged)
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.23, green: 0.23, blue: 0.23 }, // Dark Gray
                  horizontalAlignment: "CENTER",
                  textFormat: {
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 }, // White
                    bold: true,
                    fontSize: 11,
                  },
                },
              },
              fields:
                "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
            },
          });

          // Style Sub-header (A24:B24)
          matchFormattingRequests.push({
            repeatCell: {
              range: {
                sheetId: matchSheetId,
                startRowIndex: championTableStartRowIndex + 1, // A24 is row 23
                endRowIndex: championTableStartRowIndex + 2, // A25 is row 24 (exclusive)
                startColumnIndex: 0,
                endColumnIndex: 2, // A24:B24
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.23, green: 0.23, blue: 0.23 }, // Dark Gray
                  horizontalAlignment: "CENTER",
                  textFormat: {
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 }, // White
                    bold: true,
                    fontSize: 11,
                  },
                },
              },
              fields:
                "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
            },
          });

          // Add Borders to the table (A23:B...)
          matchFormattingRequests.push({
            updateBorders: {
              range: {
                sheetId: matchSheetId,
                startRowIndex: championTableStartRowIndex, // A23
                endRowIndex: championTableEndRowIndex, // End of data + 1
                startColumnIndex: 0, // A
                endColumnIndex: 2, // B + 1
              },
              top: { style: "SOLID", width: 1 },
              bottom: { style: "SOLID", width: 1 },
              left: { style: "SOLID", width: 1 },
              right: { style: "SOLID", width: 1 },
              innerHorizontal: { style: "SOLID", width: 1 }, // 内側の水平線
              innerVertical: { style: "SOLID", width: 1 }, // 内側の垂直線
            },
          });

          // Column Widths for A and B
          matchFormattingRequests.push({
            updateDimensionProperties: {
              range: {
                sheetId: matchSheetId,
                dimension: "COLUMNS",
                startIndex: 0, // A列
                endIndex: 1, // B列の手前
              },
              properties: { pixelSize: 160 }, // Adjust width as needed
              fields: "pixelSize",
            },
          });
          matchFormattingRequests.push({
            updateDimensionProperties: {
              range: {
                sheetId: matchSheetId,
                dimension: "COLUMNS",
                startIndex: 1, // B列
                endIndex: 2, // C列の手前
              },
              properties: { pixelSize: 100 }, // Adjust width as needed
              fields: "pixelSize",
            },
          });

          // Alignments for Data Rows (A25:B...)
          if (championSquadPlayers.length > 0) {
            // Player Name (A) - Left Align
            matchFormattingRequests.push({
              repeatCell: {
                range: {
                  sheetId: matchSheetId,
                  startRowIndex: championTableStartRowIndex + 2, // A25 is row 24
                  endRowIndex: championTableEndRowIndex,
                  startColumnIndex: 0, // A列
                  endColumnIndex: 1, // B列の手前
                },
                cell: { userEnteredFormat: { horizontalAlignment: "LEFT" } },
                fields: "userEnteredFormat.horizontalAlignment",
              },
            });
            // Character (B) - Center Align
            matchFormattingRequests.push({
              repeatCell: {
                range: {
                  sheetId: matchSheetId,
                  startRowIndex: championTableStartRowIndex + 2, // A25 is row 24
                  endRowIndex: championTableEndRowIndex,
                  startColumnIndex: 1, // B列
                  endColumnIndex: 2, // C列の手前
                },
                cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
                fields: "userEnteredFormat.horizontalAlignment",
              },
            });
          }
        }
        // --- End Formatting for Champion Squad Characters Table ---

        // --- Add Formatting for Most Used Characters Table (A29:B...) ---
        const mostUsedTableStartRowIndex = 28; // A29 is 0-indexed row 28
        const mostUsedTableEndRowIndex =
          mostUsedTableStartRowIndex + mostUsedCharactersData.length; // Exclusive

        if (mostUsedCharactersData.length > 1) {
          // Only format if there's data beyond the header
          // Merge Header Cell (A29:B29)
          matchFormattingRequests.push({
            mergeCells: {
              range: {
                sheetId: matchSheetId,
                startRowIndex: mostUsedTableStartRowIndex,
                endRowIndex: mostUsedTableStartRowIndex + 1, // Merge A29:B29
                startColumnIndex: 0,
                endColumnIndex: 2,
              },
              mergeType: "MERGE_ALL",
            },
          });

          // Style Header (A29)
          matchFormattingRequests.push({
            repeatCell: {
              range: {
                sheetId: matchSheetId,
                startRowIndex: mostUsedTableStartRowIndex,
                endRowIndex: mostUsedTableStartRowIndex + 1,
                startColumnIndex: 0,
                endColumnIndex: 1, // Target A29 (merged)
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.23, green: 0.23, blue: 0.23 }, // Dark Gray
                  horizontalAlignment: "CENTER",
                  textFormat: {
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 }, // White
                    bold: true,
                    fontSize: 11,
                  },
                },
              },
              fields:
                "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
            },
          });

          // Style Sub-header (A30:B30)
          matchFormattingRequests.push({
            repeatCell: {
              range: {
                sheetId: matchSheetId,
                startRowIndex: mostUsedTableStartRowIndex + 1, // A30 is row 29
                endRowIndex: mostUsedTableStartRowIndex + 2, // A31 is row 30 (exclusive)
                startColumnIndex: 0,
                endColumnIndex: 2, // A30:B30
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.23, green: 0.23, blue: 0.23 }, // Dark Gray
                  horizontalAlignment: "CENTER",
                  textFormat: {
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 }, // White
                    bold: true,
                    fontSize: 11,
                  },
                },
              },
              fields:
                "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
            },
          });

          // Add Borders to the table (A29:B...)
          matchFormattingRequests.push({
            updateBorders: {
              range: {
                sheetId: matchSheetId,
                startRowIndex: mostUsedTableStartRowIndex, // A29
                endRowIndex: mostUsedTableEndRowIndex, // End of data + 1
                startColumnIndex: 0, // A
                endColumnIndex: 2, // B + 1
              },
              top: { style: "SOLID", width: 1 },
              bottom: { style: "SOLID", width: 1 },
              left: { style: "SOLID", width: 1 },
              right: { style: "SOLID", width: 1 },
              innerHorizontal: { style: "SOLID", width: 1 }, // 内側の水平線
              innerVertical: { style: "SOLID", width: 1 }, // 内側の垂直線
            },
          });

          // Column Widths for A and B (can reuse A23 table widths or set new ones)
          matchFormattingRequests.push({
            updateDimensionProperties: {
              range: {
                sheetId: matchSheetId,
                dimension: "COLUMNS",
                startIndex: 0, // A列
                endIndex: 1, // B列の手前
              },
              properties: { pixelSize: 160 }, // Adjust width as needed
              fields: "pixelSize",
            },
          });
          matchFormattingRequests.push({
            updateDimensionProperties: {
              range: {
                sheetId: matchSheetId,
                dimension: "COLUMNS",
                startIndex: 1, // B列
                endIndex: 2, // C列の手前
              },
              properties: { pixelSize: 100 }, // Adjust width as needed
              fields: "pixelSize",
            },
          });

          // Alignments for Data Rows (A31:B...)
          if (sortedCharacters.length > 0) {
            // Character (A) - Left Align
            matchFormattingRequests.push({
              repeatCell: {
                range: {
                  sheetId: matchSheetId,
                  startRowIndex: mostUsedTableStartRowIndex + 2, // A31 is row 30
                  endRowIndex: mostUsedTableEndRowIndex,
                  startColumnIndex: 0, // A列
                  endColumnIndex: 1, // B列の手前
                },
                cell: { userEnteredFormat: { horizontalAlignment: "LEFT" } },
                fields: "userEnteredFormat.horizontalAlignment",
              },
            });
            // Count (B) - Center Align
            matchFormattingRequests.push({
              repeatCell: {
                range: {
                  sheetId: matchSheetId,
                  startRowIndex: mostUsedTableStartRowIndex + 2, // A31 is row 30
                  endRowIndex: mostUsedTableEndRowIndex,
                  startColumnIndex: 1, // B列
                  endColumnIndex: 2, // C列の手前
                },
                cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
                fields: "userEnteredFormat.horizontalAlignment",
              },
            });
          }
        }
        // --- End Formatting for Most Used Characters Table ---

        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: matchFormattingRequests,
          },
        });

        console.log(`Formatting applied to "${matchSheetName}" sheet.`);
      } catch (writeMatchError: any) {
        console.error(
          `Error writing or formatting "${matchSheetName}" sheet:`,
          writeMatchError.response?.data || writeMatchError
        );
        // Continue to the next match or throw error? Let's throw for now.
        throw new Error(
          `Failed to write data to "${matchSheetName}" sheet: ` +
            (writeMatchError.response?.data?.error?.message ||
              writeMatchError.message)
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("データ書き込み処理全体の予期せぬエラー:", error);
    // Use the error message from the thrown error if available
    const errorMessage = error.message.startsWith("Failed to")
      ? error.message
      : "データの書き込みに失敗しました";

    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function writeToSheet(auth: any, spreadsheetId: string, data: string[][]) {
  const sheets = google.sheets({ version: "v4", auth });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response: any = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Total Result!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: data,
    },
  });
  return response;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSheetData(auth: any, spreadsheetId: string, range: string) {
  const sheets = google.sheets({ version: "v4", auth });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response: any = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    majorDimension: "ROWS",
  });
  return response.data.values as any[][] || [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function appendToSheet(auth: any, spreadsheetId: string, data: string[][]) {
  const sheets = google.sheets({ version: "v4", auth });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response: any = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Total Result!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: data,
    },
  });
  return response;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function clearSheet(auth: any, spreadsheetId: string, range: string) {
  const sheets = google.sheets({ version: "v4", auth });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response: any = await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range,
  });
  return response;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function formatSheet(auth: any, spreadsheetId: string, sheetId: number, numColumns: number) {
  const sheets = google.sheets({ version: "v4", auth });

  const requests: any[] = [
    {
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        fields: "gridProperties.frozenRowCount",
      },
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: "ROWS",
          startIndex: 0, // Header row
          endIndex: 1,
        },
        properties: {
          pixelSize: 40,
        },
        fields: "pixelSize",
      },
    },
  ];

  for (let i = 0; i < numColumns; i++) {
    // Column widths
    requests.push({
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: "COLUMNS",
          startIndex: i,
          endIndex: i + 1,
        },
        properties: {
          pixelSize: 100,
        },
        fields: "pixelSize",
      },
    });
  }

  // Banding
  requests.push({
    addBanding: {
      bandedRange: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: numColumns,
        },
        rowProperties: {
          headerColor: {
            red: 0.23,
            green: 0.23,
            blue: 0.23,
          },
          firstBandColor: {
            red: 1.0,
            green: 1.0,
            blue: 1.0,
          },
          secondBandColor: {
            red: 0.95,
            green: 0.95,
            blue: 0.95,
          },
        },
      },
    },
  });

  // Execute the batchUpdate request
  const batchUpdateRequest: any = { requests };
  await sheets.spreadsheets.batchUpdate(batchUpdateRequest);
}
