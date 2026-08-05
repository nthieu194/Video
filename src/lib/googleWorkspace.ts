import { VideoScript } from '../types';

/**
 * Searches for or creates a folder called 'ClipFlow - Kịch Bản Video' in Google Drive.
 * Returns the folder ID.
 */
export async function getOrCreateFolder(accessToken: string): Promise<string> {
  const query = encodeURIComponent("name = 'ClipFlow - Kịch Bản Video' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
  
  try {
    const res = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || "Không thể tìm kiếm thư mục trên Google Drive.");
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    // Create the folder if it doesn't exist
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'ClipFlow - Kịch Bản Video',
        mimeType: 'application/vnd.google-apps.folder'
      })
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      throw new Error(errData.error?.message || "Không thể tạo thư mục mới trên Google Drive.");
    }

    const folder = await createRes.json();
    return folder.id;
  } catch (error) {
    console.error("Error in getOrCreateFolder:", error);
    throw error;
  }
}

/**
 * Generates the clean formatted text for a VideoScript.
 */
export function formatScriptToText(script: VideoScript): string {
  let output = `======================================================================
KỊCH BẢN VIDEO NGẮN: ${script.title.toUpperCase()}
======================================================================

[THÔNG TIN CHUNG]
• Phong cách tiếp tiếp cận: ${script.style}
• Thời lượng dự kiến: ${script.duration} giây
• Tông giọng chủ đạo: ${script.tone}
• Khán giả mục tiêu: ${script.targetAudience}

[Ý TƯỞNG GỐC]
${script.originalIdea}

----------------------------------------------------------------------
DANH SÁCH PHÂN CẢNH CHI TIẾT (STORYBOARD)
----------------------------------------------------------------------
`;

  script.scenes.forEach((scene, index) => {
    output += `
CẢNH ${index + 1} (${scene.timeRange}):
• Giọng thoại / Voiceover:
  "${scene.dialogue}"

• Mô tả khung hình & Ý đồ góc quay:
  ${scene.visualDescription}

• Ý tưởng gợi ý âm thanh & Hiệu ứng:
  ${scene.audioSuggestion || "Nhạc nền lofi không lời nhẹ nhàng"}
  
• Từ khóa vẽ hình minh họa (Prompt AI):
  [${scene.illustrationPrompt}]

----------------------------------------------------------------------`;
  });

  output += `

[PHÂN TÍCH XU HƯỚNG & ĐỘC ĐÁO (VIRAL HOOK)]
${script.trendAnalysis}

[THẺ HASHTAG GỢI Ý]
${script.suggestedHashtags.join(' ')}

[LỜI KHUYÊN HẬU KỲ VÀ SẢN XUẤT THỰC CHIẾN]
`;

  script.productionTips.forEach((tip, idx) => {
    output += `${idx + 1}. ${tip}\n`;
  });

  output += `
======================================================================
Ứng dụng chế tác bởi ClipFlow - Short Video Script Planner (AI Powered)
Tạo lúc: ${new Date().toLocaleString('vi-VN')}
======================================================================`;

  return output;
}

/**
 * Generates the clean formatted HTML for a VideoScript to be converted into Google Doc.
 */
export function formatScriptToHtml(script: VideoScript): string {
  let scenesHtml = '';
  script.scenes.forEach((scene, index) => {
    scenesHtml += `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h3 style="color: #ff3b5c; margin-top: 0; margin-bottom: 10px; font-size: 16px; border-bottom: 1px solid #fed7aa; padding-bottom: 5px;">PHÂN CẢNH ${index + 1} (${scene.timeRange})</h3>
        <p><strong>🎙️ Giọng thoại / Voiceover:</strong></p>
        <blockquote style="background-color: #ffffff; border-left: 4px solid #ff3b5c; padding: 10px; margin: 10px 0; font-style: italic; color: #1e293b;">
          "${scene.dialogue}"
        </blockquote>
        
        <p><strong>🎬 Ghi hình & Hoạt động Diễn xuất:</strong></p>
        <p style="color: #334155; margin-left: 10px;">${scene.visualDescription}</p>
        
        <p><strong>🎵 Âm nhạc & Hiệu ứng SFX:</strong></p>
        <p style="color: #475569; margin-left: 10px; font-style: italic;">${scene.audioSuggestion || "Nhạc nền lofi không lời nhẹ nhàng"}</p>
        
        <p><strong>🎨 Từ khóa vẽ hình minh họa (Prompt AI):</strong></p>
        <p style="background-color: #f1f5f9; font-family: monospace; padding: 8px; border-radius: 4px; font-size: 11px; color: #0f172a; margin-left: 10px;">${scene.illustrationPrompt || "Cinematic aspect-ratio 9:16"}</p>
      </div>
    `;
  });

  let productionTipsHtml = '';
  script.productionTips.forEach((tip, idx) => {
    productionTipsHtml += `<li style="margin-bottom: 8px;">${tip}</li>`;
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${script.title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px double #ff3b5c; padding-bottom: 20px;">
        <h1 style="color: #ff3b5c; font-size: 28px; margin-bottom: 10px; font-weight: bold; text-transform: uppercase;">Kịch bản Video Ngắn: ${script.title}</h1>
        <p style="color: #64748b; font-size: 14px; font-style: italic;">Tạo tự động bởi ClipFlow • Ngày tạo: ${new Date().toLocaleString('vi-VN')}</p>
      </div>

      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
        <h2 style="color: #d97706; font-size: 18px; margin-top: 0; border-bottom: 1px solid #fde68a; padding-bottom: 5px;">📍 THÔNG TIN CHUNG</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; width: 35%; font-weight: bold; color: #475569;">🎭 Thể loại kịch bản:</td>
            <td style="padding: 6px 0; color: #1e293b;">${script.style}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569;">⏰ Thời lượng dự kiến:</td>
            <td style="padding: 6px 0; color: #1e293b; font-weight: bold;">${script.duration} giây</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569;">🎯 Khán giả mục tiêu:</td>
            <td style="padding: 6px 0; color: #1e293b;">${script.targetAudience}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569;">🎙️ Giọng điệu chủ đạo:</td>
            <td style="padding: 6px 0; color: #1e293b; font-style: italic;">${script.tone}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 35px;">
        <h2 style="color: #0f172a; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; text-transform: uppercase;">💡 Ý TƯỎNG GỐC</h2>
        <p style="background-color: #fafafa; border-left: 4px solid #64748b; padding: 12px; font-style: italic; color: #334155; margin-top: 10px; border-radius: 0 8px 8px 0;">
          ${script.originalIdea}
        </p>
      </div>

      <div style="margin-bottom: 35px;">
        <h2 style="color: #0f172a; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; text-transform: uppercase; margin-bottom: 20px;">🎬 PHÂN CẢNH CHI TIẾT (STORYBOARD)</h2>
        ${scenesHtml}
      </div>

      <div style="margin-bottom: 35px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 25px;">
        <h2 style="color: #15803d; font-size: 18px; margin-top: 0; border-bottom: 1px solid #86efac; padding-bottom: 5px; text-transform: uppercase;">🚀 PHÂN TÍCH XU HƯỚNG & DẤU ẤN ĐẶC BIỆT</h2>
        <p style="color: #1e293b; font-size: 13.5px; line-height: 1.7; margin-top: 10px;">${script.trendAnalysis}</p>
        <p style="margin-top: 15px; font-weight: bold; color: #166534; font-size: 13px;">📌 Thẻ hashtags thịnh hành:</p>
        <p style="font-family: inherit; color: #22c55e; font-weight: bold; font-size: 13px; margin: 5px 0 0 0;">${script.suggestedHashtags.join(' ')}</p>
      </div>

      <div style="margin-bottom: 35px;">
        <h2 style="color: #0f172a; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; text-transform: uppercase;">🛠️ LỜI KHUYÊN SẢN XUẤT & BIÊN TẬP HẬU KỲ</h2>
        <ul style="padding-left: 20px; font-size: 13.5px; color: #334155; margin-top: 10px;">
          ${productionTipsHtml}
        </ul>
      </div>

      <div style="text-align: center; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8;">
        <p>Tài liệu được chuyển đổi thông minh từ ClipFlow Short Custom Planner</p>
        <p>© 2026 ClipFlow Studio. Bảo lưu mọi quyền.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Exports a VideoScript to Google Docs.
 * This creates a new Google Doc inside the 'ClipFlow - Kịch Bản Video' folder,
 * and populates it with the beautifully structured script template.
 */
export async function exportToGoogleDoc(accessToken: string, script: VideoScript): Promise<{ docId: string; url: string }> {
  try {
    // 1. Get or create the folder
    const folderId = await getOrCreateFolder(accessToken);

    // 2. Format HTML content for premium presentation
    const htmlContent = formatScriptToHtml(script);

    // 3. Create a multipart upload for the HTML file converting to Google Doc in Drive
    const metadata = {
      name: `Kịch bản: ${script.title}`,
      mimeType: 'application/vnd.google-apps.document',
      parents: [folderId]
    };

    const boundary = '314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const body = 
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
      htmlContent +
      closeDelimiter;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: body
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || "Không thể khởi tạo hoặc chuyển đổi tài liệu Google Docs.");
    }

    const data = await res.json();
    const docId = data.id;

    return {
      docId,
      url: `https://docs.google.com/document/d/${docId}/edit`
    };
  } catch (error) {
    console.error("Error in exportToGoogleDoc:", error);
    throw error;
  }
}

/**
 * Exports a VideoScript directly as a Markdown (.md) file to Google Drive.
 */
export async function exportToMarkdown(accessToken: string, script: VideoScript): Promise<{ fileId: string; url: string }> {
  try {
    const folderId = await getOrCreateFolder(accessToken);
    const contentText = formatScriptToText(script);

    // Create a multipart upload for the text file to Google Drive
    const metadata = {
      name: `${script.title.replace(/[\/\\?%*:|"<>\s]+/g, '_')}_kichban.md`,
      mimeType: 'text/markdown',
      parents: [folderId]
    };

    const boundary = '314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const body = 
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/markdown; charset=UTF-8\r\n\r\n' +
      contentText +
      closeDelimiter;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: body
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || "Không thể tải tập tin kịch bản lên Google Drive.");
    }

    const data = await res.json();
    return {
      fileId: data.id,
      url: `https://drive.google.com/file/d/${data.id}/view`
    };
  } catch (error) {
    console.error("Error in exportToMarkdown:", error);
    throw error;
  }
}

/**
 * Filters and lists Google Docs or general files created in the user's Google Drive.
 */
export async function listGoogleDriveFiles(accessToken: string): Promise<any[]> {
  try {
    // List either folders, docs or markdown files created
    const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/markdown' and trashed = false");
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&pageSize=15&fields=files(id,name,mimeType,webViewLink,modifiedTime)`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || "Không thể lấy danh sách tệp từ Google Drive.");
    }

    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error("Error in listGoogleDriveFiles:", error);
    throw error;
  }
}

/**
 * Retrieve text content of a Google Document using standard Google Drive API export format.
 */
export async function getDocTextContent(accessToken: string, docId: string): Promise<string> {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${docId}/export?mimeType=text/plain`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || "Không thể tải nội dung văn bản qua Google Drive Export.");
    }

    const textContent = await res.text();
    return textContent.trim();
  } catch (error) {
    console.error("Error in getDocTextContent:", error);
    throw error;
  }
}
