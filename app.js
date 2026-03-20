document.addEventListener("DOMContentLoaded", () => {
  const evalForm = document.getElementById("evalForm");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const emptyState = document.getElementById("emptyState");
  const loadingState = document.getElementById("loadingState");
  const reportViewer = document.getElementById("reportViewer");
  const resetDataBtn = document.getElementById("reset-data-btn");
  const apiKeyInput = document.getElementById("api-key");

  if (typeof marked === 'undefined') {
    console.error("marked.js is not loaded!");
  } else {
    marked.setOptions({ breaks: true, gfm: true });
  }

  if (typeof XLSX === 'undefined') {
    console.error("xlsx.js is not loaded!");
  }

  const universitySelect = document.getElementById("university");
  const majorSelect = document.getElementById("major");
  const categorySelect = document.getElementById("category");
  const excelUpload = document.getElementById("excel-upload");
  const studentSelect = document.getElementById("student-select");
  const gradeInput = document.getElementById("student-grade");
  const classInput = document.getElementById("student-class");
  const numberInput = document.getElementById("student-number");
  const nameInput = document.getElementById("student-name");
  const courseExcelUpload = document.getElementById("course-excel-upload");
  const coursesInput = document.getElementById("courses");
  const batchExcelUpload = document.getElementById("batch-excel-upload");
  const subjectInput = document.getElementById("subject-records");
  const creativeInput = document.getElementById("creative-activities");
  const behaviorInput = document.getElementById("behavioral-records");
  const achievementOnlyInput = document.getElementById("achievement-only");
  const averageGradeInput = document.getElementById("average-grade");

  let globalCourseJson = null;
  let globalBatchJsons = [];
  let lastReportData = null; // PDF 인쇄용 최신 데이터 저장

  const universityData = {
    "고려대학교": {
      "인문·사회계열": ["철학과", "한국어문학과", "영어영문학과", "사회학과", "심리학과", "독어독문학과", "노어노문학과", "중어중문학과", "불어불문학과", "정치외교학과", "행정학과", "경제학과"],
      "자연·공학·생활계열": ["생명과학부", "환경생태공학부", "뇌인지과학과", "스마트보안학부", "데이터과학부", "사이버국방학과", "반도체공학과", "신소재공학부", "화공생명공학부", "기계공학부", "의생명공학부", "전기전자공학부", "컴퓨터학과", "산업경영공학부"],
      "경상 기타": ["경영대학", "국제학부", "디자인조형학부", "체육교육과"]
    },
    "서울대학교": {
      "인문·사회계열": ["철학과", "국어국문학과", "영어영문학과", "독어독문학과", "불어불문학과", "노어노문학과", "서어서문학과", "언어학과", "동양사학과", "서양사학과", "고고미술사학과", "종교학과", "미학과", "사학과", "국어교육과", "영어교육과", "사회교육과", "역사교육과", "지리교육과", "윤리교육과", "소비자학과", "아동가족학과", "의류학과", "경제학부", "사회학과", "사회복지학과"],
      "자연·공학·생활계열": ["전기정보공학부", "컴퓨터공학부", "기계공학부", "항공우주공학과", "조선해양공학과", "화학생물공학부", "재료공학부", "건축학과", "건설환경공학부", "산업공학과", "원자핵공학과", "에너지자원공학과", "수학과", "물리학과", "화학과", "생명과학부", "수의예과", "약학과", "의예과", "치의예과", "간호학과"],
      "경상·예체능": ["경영학과", "인류학과", "지리학과", "음악대학", "미술학과", "체육교육과"]
    },
    "연세대학교": {
      "인문·사회계열": ["한국어문학과", "중어중문학과", "영어영문학과", "독어독문학과", "불어불문학과", "노어노문학과", "사학과", "철학과", "문헌정보학과", "심리학과", "경제학부", "행정학과", "사회학과", "사회복지학과", "정치외교학과", "언론홍보영상학부", "교육학과", "문화인류학과", "국어교육과", "영어교육과", "수학교육과"],
      "자연·공학·생활계열": ["수학과", "물리학과", "화학과", "지구시스템과학과", "대기과학과", "천문우주학과", "전기전자공학부", "기계공학부", "토목환경공학과", "화공생명공학부", "신소재공학부", "도시공학과", "IT융합공학과", "반도체공학부", "생명시스템대학"],
      "국제·경영": ["경영대학", "경제대학", "의과대학", "치과대학", "간호대학", "생명공학부", "아동가족학과", "식품영양학과"]
    },
    "한양대학교": {
      "인문·사회계열": ["국어국문학과", "영어영문학과", "독어독문학과", "사학과", "철학과", "정치외교학과", "사회학과", "미디어커뮤니케이션학과", "경제금융학부", "행정학과", "국제학부"],
      "자연·공학·생활계열": ["수학과", "물리학과", "화학과", "건축학부", "기계공학부", "전기전자공학부", "컴퓨터소프트웨어학부", "에너지공학과", "원자력공학과", "산업공학과", "생명공학과", "간호학부"],
      "경상·예체능": ["경영학부", "영어교육과", "수학교육과", "체육교육과"]
    },
    "성균관대학교": {
      "개설학과": ["유학·동양학과", "국어국문학과", "영어영문학과", "한문학과", "사학과", "철학과", "행정학과", "정치외교학과", "사회학과", "사회복지학과", "심리학과", "경제학과", "통계학과", "법학과", "경영학과", "소프트웨어학과", "반도체시스템공학과", "전자전기공학부", "화학공학부", "기계공학부", "건설환경공학부", "건축학과", "나노공학과", "식품생명공학과", "의상학과", "체육교육과", "교육학과"]
    },
    "중앙대학교": {
      "인문·사회계열": ["철학과", "영어영문학과", "국어국문학과", "역사학과", "정치외교학과", "사회학과", "사회복지학과", "경제학부", "문헌정보학과", "교육학과", "유아교육학과"],
      "자연·공학계열": ["수학과", "화학과", "물리학과", "생명과학과", "건축학부", "기계공학부", "전자전기공학부", "컴퓨터공학부", "소프트웨어학부", "AI학과", "간호학과"],
      "경상·예체능": ["경영학부", "광고홍보학과", "체육교육학과", "스포츠과학부"]
    },
    "경희대학교": {
      "인문·사회계열": ["국어국문학과", "사학과", "철학과", "영어영문학과", "지리학과", "법학과", "행정학과", "정치외교학과", "사회학과", "경제학과", "무역학과"],
      "자연·공학계열": ["수학과", "물리학과", "화학과", "생물학과", "식품영양학과", "체육학과", "태권도학과", "간호학과", "한의예과"],
      "경상·예체능": ["경영학과", "호텔경영학과", "관광학과"]
    },
    "한국외국어대학교": {
      "외국어·문화계열": ["ELLT학과", "영미문학·문화학과", "영어통번역학부", "프랑스어학과", "독일어학과", "노어학과", "스페인어학과", "이탈리아어학과", "포르투갈어학과", "아랍어학부", "이란어학과", "몽골어학과", "말레이·인도네시아어학부", "태국어학과", "베트남어학과", "한국어학과", "중국어학부", "일본어학부"],
      "사회·교육계열": ["정치외교학과", "행정학과", "미디어커뮤니케이션학부", "경제학과", "국제금융학과", "국제학과", "국제통상학과"],
      "자연·AI계열": ["수학과", "통계학과", "Language&AI융합학과", "AI데이터사이언스학부", "Finance&AI융합학과"]
    },
    "건국대학교": {
      "개설학과": ["경영학과", "기술경영학과", "부동산학과", "첨단바이오공학과", "통합생명공학부", "동물자원학과", "환경보건학과", "커뮤니케이션학부", "산업전자학부", "영상전자학부", "의학과", "KU자유학예학과"]
    },
    "단국대학교": {
      "개설학과": ["법과대", "공연예술학부", "스포츠과학부", "통합전공(미래모빌리티전공, 빅데이터비즈니스전공, 공연예술전공, 지능·로봇공학전공, 스마트도시·데이터사이언스전공, 의료서비스케어AI전공)"]
    },
    "아주대학교": {
      "개설학과": ["경영정보학부", "사회복지학과", "사이버보안학과", "수학과", "물리학과", "화학과", "생명과학과", "정보보호학과", "소프트웨어학과", "컴퓨터공학과", "전자공학과", "기계공학과", "산업공학과", "화학공학과", "건축학과", "의학과", "간호학과", "AI융합학부"]
    },
    "서울시립대학교": {
      "인문·사회계열": ["국어국문학과", "영어영문학과", "국사학과", "철학과", "행정학과", "경제학부", "사회복지학과", "세무학과", "경영학부", "사회학과", "중국어문화학과"],
      "자연·공학계열": ["수학과", "통계학과", "물리학과", "화학과", "환경원예학과", "컴퓨터과학부", "전자전기컴퓨터공학부", "화학공학과", "기계정보공학과", "신소재공학과", "토목공학과", "건축학부"],
      "도시·자유전공": ["도시공학과", "교통공학과", "공간정보공학과", "인공지능학과", "자유전공학부"]
    },
    "동국대학교": {
      "인문·사회계열": ["국어국문학과", "영어영문학과", "일본어통번역학과", "중어중문학과", "사학과", "철학과", "행정학과", "정치외교학과", "사회학과", "경제학과", "경영학과", "회계학과", "법과대학", "미디어커뮤니케이션학과", "문화재학과"],
      "자연·공학계열": ["수학과", "물리반도체과학부", "화학과", "생명과학과", "바이오환경과학과", "컴퓨터공학전공", "AI소프트웨어학부", "전자전기공학부", "기계로봇에너지공학과", "건설환경공학과", "건축학부", "통계학과"],
      "의료·자유전공": ["의예과", "약학과", "불교학부", "열린전공학부"]
    },
    "홍익대학교": {
      "인문·자연계열": ["국어교육과", "영어교육과", "역사교육과", "수학교육과", "경영학부", "경제학부", "법학부", "불어불문학과", "독어독문학과", "영어영문학과", "사학과", "철학과", "수학과", "물리학과", "화학과", "전자전기공학부", "컴퓨터공학과", "화학공학과", "건설환경공학부", "건축학부", "기계시스템디자인공학과", "신소재공학부"],
      "미술·디자인계열": ["회화과", "조각과", "도예유리과", "목조형가구학과", "섬유미술패션디자인과", "금속조형디자인과", "시각디자인학과", "산업디자인학과", "영상학과", "판화과", "예술학과"]
    }
  };

  for (const uni of Object.keys(universityData)) {
    const option = document.createElement("option");
    option.value = uni; option.textContent = uni;
    universitySelect.appendChild(option);
  }

  // 1단계: 대학 선택 → 계열 채우기
  universitySelect.addEventListener("change", () => {
    const selectedUni = universitySelect.value;
    const majorsData = universityData[selectedUni];
    categorySelect.innerHTML = "<option value='' disabled selected>계열을 선택하세요</option>";
    majorSelect.innerHTML = "<option value='' disabled selected>지원 학과를 선택하세요</option>";
    if (!majorsData) return;
    const categories = Object.keys(majorsData);
    if (categories.length === 1 && categories[0] === "개설학과") {
      const opt = document.createElement("option");
      opt.value = "개설학과"; opt.textContent = "전체";
      categorySelect.appendChild(opt);
      categorySelect.value = "개설학과";
      majorsData["개설학과"].forEach(major => {
        const o = document.createElement("option");
        o.value = major; o.textContent = major;
        majorSelect.appendChild(o);
      });
    } else {
      categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat; opt.textContent = cat;
        categorySelect.appendChild(opt);
      });
    }
  });

  // 2단계: 계열 선택 → 학과 채우기
  categorySelect.addEventListener("change", () => {
    const selectedUni = universitySelect.value;
    const selectedCat = categorySelect.value;
    const majorsData = universityData[selectedUni];
    majorSelect.innerHTML = "<option value='' disabled selected>지원 학과를 선택하세요</option>";
    if (!majorsData || !majorsData[selectedCat]) return;
    majorsData[selectedCat].forEach(major => {
      const o = document.createElement("option");
      o.value = major; o.textContent = major;
      majorSelect.appendChild(o);
    });
  });

  if (excelUpload) {
    excelUpload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (evt) {
        try {
          const workbook = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
          const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
          if (!studentSelect) return;
          studentSelect.innerHTML = "<option value='' disabled selected>학생을 선택하세요</option>";
          let studentCount = 0;
          let headerRowIndex = -1;
          for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
            if (!jsonData[i]) continue;
            const rowStr = jsonData[i].join("").replace(/\s+/g, "");
            if (rowStr.includes("성명") || rowStr.includes("이름")) { headerRowIndex = i; break; }
          }
          if (headerRowIndex !== -1) {
            const headerRow = jsonData[headerRowIndex];
            const nameCol = headerRow.findIndex(c => c && (String(c).replace(/\s+/g, "").includes("성명") || String(c).replace(/\s+/g, "").includes("이름")));
            const gradeCol = headerRow.findIndex(c => c && String(c).replace(/\s+/g, "") === "학년");
            const classCol = headerRow.findIndex(c => c && String(c).replace(/\s+/g, "") === "반");
            const numCol = headerRow.findIndex(c => c && String(c).replace(/\s+/g, "").includes("번호"));
            const hakbunCol = headerRow.findIndex(c => c && String(c).replace(/\s+/g, "").includes("학번"));
            for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
              const row = jsonData[i];
              if (!row) continue;
              let sName = nameCol !== -1 ? String(row[nameCol] || "").trim() : "";
              if (!sName || sName === "undefined") continue;
              let sGrade = gradeCol !== -1 ? String(row[gradeCol] || "").replace(/[^0-9]/g, "") : "";
              let sClass = classCol !== -1 ? String(row[classCol] || "").replace(/[^0-9]/g, "") : "";
              let sNum = numCol !== -1 ? String(row[numCol] || "").replace(/[^0-9]/g, "") : "";
              if (hakbunCol !== -1 && row[hakbunCol]) {
                let hakbun = String(row[hakbunCol]).replace(/[^0-9]/g, "");
                if (hakbun.length >= 4) {
                  if (!sGrade) sGrade = hakbun.substring(0, 1);
                  if (!sClass) sClass = hakbun.substring(1, 3).replace(/^0+/, "");
                  if (!sNum) sNum = hakbun.substring(3).replace(/^0+/, "");
                }
              }
              const option = document.createElement("option");
              option.value = sName;
              option.dataset.grade = sGrade; option.dataset.class = sClass; option.dataset.number = sNum;
              let label = [];
              if (sGrade) label.push(sGrade + "학년");
              if (sClass) label.push(sClass + "반");
              if (sNum) label.push(sNum + "번");
              label.push(sName);
              option.textContent = label.join(" ");
              studentSelect.appendChild(option);
              studentCount++;
            }
          }
          if (studentCount > 0) {
            alert("총 " + studentCount + "명의 인적사항이 불러와졌습니다. 아래에서 학생을 선택하세요.");
            studentSelect.focus();
          } else {
            alert("인적사항 데이터를 불러오지 못했거나 해당 형식을 찾을 수 없습니다.");
          }
        } catch (error) { console.error(error); alert("파일 읽는 중 오류가 발생했습니다."); }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  if (studentSelect) {
    studentSelect.addEventListener("change", () => {
      console.log("studentSelect change event triggered.");
      saveState();
      const selected = studentSelect.options[studentSelect.selectedIndex];
      if (!selected || selected.disabled) return;
      if (gradeInput) gradeInput.value = selected.dataset.grade || "";
      if (classInput) classInput.value = selected.dataset.class || "";
      if (numberInput) numberInput.value = selected.dataset.number || "";
      if (nameInput) nameInput.value = selected.value || "";
      const targetName = nameInput.value.trim();
      if (targetName) {
        if (globalCourseJson) extractCourseData(globalCourseJson, targetName);
        if (globalBatchJsons.length > 0) extractBatchData(globalBatchJsons, targetName);
      }
    });
  }

  if (courseExcelUpload) {
    courseExcelUpload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (evt) {
        try {
          const workbook = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
          // 모든 시트 통합
          const allRows = [];
          for (const sheetName of workbook.SheetNames) {
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
            if (rows.length > 0) allRows.push(...rows);
          }
          globalCourseJson = allRows;
          const targetName = nameInput ? nameInput.value.trim() : "";
          if (targetName) { extractCourseData(globalCourseJson, targetName); }
          else { alert("이수과목 파일이 불러와졌습니다. 먼저 학생을 선택하시면 이수과목이 자동 추출됩니다."); }
          saveState();
        } catch (error) { console.error(error); alert("파일 읽는 중 오류가 발생했습니다."); }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  function extractCourseData(jsonData, targetName) {
    const tgt = targetName.replace(/\s+/g, "");

    // 헤더 행 탐색 (성명 셀 기준)
    let headerRowIdx = -1, nameCol = -1;
    let gradeYearCol = -1, termCol = -1;
    let subjectCol = -1, subjectCol2 = -1, creditCol = -1, gradeCol = -1, achieveCol = -1;

    for (let i = 0; i < Math.min(jsonData.length, 15); i++) {
      if (!jsonData[i]) continue;
      for (let j = 0; j < jsonData[i].length; j++) {
        const cell = String(jsonData[i][j] || "").replace(/\s+/g, "");
        if (cell === "성명" || cell === "이름") { nameCol = j; headerRowIdx = i; break; }
      }
      if (headerRowIdx !== -1) break;
    }
    if (headerRowIdx === -1) { alert("이수과목 파일에서 성명 열을 찾을 수 없습니다."); return; }

    // 헤더 행에서 컬럼 탐지
    const headerRow = jsonData[headerRowIdx] || [];
    for (let j = 0; j < headerRow.length; j++) {
      const cell = String(headerRow[j] || "").replace(/\s+/g, "");
      if (!cell) continue;
      if (gradeYearCol === -1 && (cell === "학년" || cell.endsWith("학년"))) gradeYearCol = j;
      if (termCol === -1 && (cell === "학기" || cell.endsWith("학기"))) termCol = j;
      if (cell === "과목" || cell === "교과목" || cell === "교과목명" || cell === "과목명" || cell === "이수과목") subjectCol = j;
      else if (subjectCol2 === -1 && (cell === "교과" || cell === "과목군" || cell === "교과군" || cell === "교과영역")) subjectCol2 = j;
      if (creditCol === -1 && (cell === "단위수" || cell === "단위" || cell === "이수단위" || cell.endsWith("단위수"))) creditCol = j;
      // 석차등급: 가장 오른쪽(마지막) 컬럼 우선
      if (cell === "석차등급" || cell.endsWith("석차등급")) gradeCol = j;
      else if (gradeCol === -1 && (cell === "등급" || cell.endsWith("등급"))) gradeCol = j;
      if (achieveCol === -1 && cell.includes("성취도")) achieveCol = j;
    }
    // 위치 기반 폴백 (NEIS 표준: 번호|성명|학년|학기|교과군|과목|단위수|...|석차등급)
    if (subjectCol === -1 && headerRow.length >= 6) subjectCol = 5;   // C6
    if (creditCol === -1 && headerRow.length >= 7) creditCol = 6;   // C7
    if (gradeCol === -1 && headerRow.length >= 10) gradeCol = 9;   // C10

    const dataStartIndex = headerRowIdx + 1;
    const extractedCourses = [], achieveOnlyCourses = [];
    let totalWeightedSum = 0, totalCredits = 0, currentStudent = "";

    for (let i = dataStartIndex; i < jsonData.length; i++) {
      const row = jsonData[i]; if (!row) continue;
      // 병합셀 패턴: 성명이 있을 때만 갱신, 없으면 직전 학생 유지
      const cn = String(row[nameCol] || "").replace(/\s+/g, "");
      if (cn) currentStudent = cn;
      if (!currentStudent || currentStudent !== tgt) continue;

      // 과목명 추출
      let subject = subjectCol !== -1 ? String(row[subjectCol] || "").trim() : "";
      if (!subject && subjectCol2 !== -1) subject = String(row[subjectCol2] || "").trim();
      if (!subject || subject === "undefined") continue;
      if (subject.includes("평균") || subject.includes("합계") || subject.includes("소계")) continue;
      if (subject === "계") continue;
      extractedCourses.push(subject);

      // 단위수 추출
      let credit = 0;
      if (creditCol !== -1 && row[creditCol] != null) {
        const cm = String(row[creditCol]).match(/\d+(\.\d+)?/);
        if (cm) credit = parseFloat(cm[0]);
      }
      if (credit <= 0) credit = 1;

      // 석차등급 — 순수 숫자(1~9)만 계산에 포함, P는 제외
      let gradeVal = NaN;
      if (gradeCol !== -1 && row[gradeCol] != null) {
        const grStr = String(row[gradeCol]).trim();
        const isP = /^[Pp]$/.test(grStr) || (grStr.toUpperCase().includes("P") && !/\d/.test(grStr));
        if (!isP) {
          const gm = grStr.match(/^(\d+)(\.\d+)?$/);
          if (gm) gradeVal = parseFloat(grStr);
        }
      }

      if (!isNaN(gradeVal) && gradeVal >= 1 && gradeVal <= 9) {
        totalWeightedSum += credit * gradeVal;
        totalCredits += credit;
      } else {
        const achieve = achieveCol !== -1 ? String(row[achieveCol] || "").trim() : "";
        if (achieve && achieve.toUpperCase() !== "P") achieveOnlyCourses.push(subject + "(" + achieve + ")");
      }
    }

    // 결과 반영
    const coursesInput = document.getElementById("courses");
    if (extractedCourses.length > 0) {
      if (coursesInput) coursesInput.value = extractedCourses.join(", ");
      const avgLabel = totalCredits > 0
        ? "가중평균 " + (totalWeightedSum / totalCredits).toFixed(2) + "등급"
        : "등급 산출 불가";
      alert("'" + targetName + "' 학생의 이수과목 " + extractedCourses.length + "개 추출 완료. (" + avgLabel + ")");
    } else {
      if (coursesInput) coursesInput.value = "";
      alert("해당 파일에서 '" + targetName + "' 학생의 데이터를 찾을 수 없습니다.");
    }
    const agInput = document.getElementById("average-grade");
    if (agInput) agInput.value = totalCredits > 0
      ? (totalWeightedSum / totalCredits).toFixed(2) + " 등급  [Σ(단위수×등급) = " + totalWeightedSum.toFixed(1) + " / 총 " + totalCredits + "단위]"
      : "석차등급 없음 (성취도 전용 과목)";
    const aoInput = document.getElementById("achievement-only");
    if (aoInput) aoInput.value = achieveOnlyCourses.length > 0 ? achieveOnlyCourses.join(", ") : "해당 없음";
  }

  if (batchExcelUpload) {
    batchExcelUpload.addEventListener("change", async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      globalBatchJsons = [];
      for (const file of files) {
        try {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
          // 모든 시트의 데이터를 통합
          const allSheetData = [];
          for (const sheetName of workbook.SheetNames) {
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
            if (rows.length > 0) allSheetData.push(...rows);
          }
          globalBatchJsons.push({ fileName: file.name, jsonData: allSheetData });
        } catch (err) { console.error(err); }
      }
      const targetName = nameInput ? nameInput.value.trim() : "";
      if (targetName) { extractBatchData(globalBatchJsons, targetName); }
      else { alert("세부능력 기록 파일이 불러와졌습니다. 학생을 선택하시면 자동 추출됩니다."); }
      saveState();
    });
  }

  function extractBatchData(jsonsArray, targetName) {
    if (!targetName) return;
    if (subjectInput) subjectInput.value = "";
    if (creativeInput) creativeInput.value = "";
    if (behaviorInput) behaviorInput.value = "";

    const tgt = targetName.replace(/\s+/g, "");

    for (const dataObj of jsonsArray) {
      const { fileName, jsonData } = dataObj;
      if (!jsonData || jsonData.length === 0) continue;

      // ── 파일명으로 초기 유형 추정 (창체 키워드 우선) ──
      let fileTypeHint;
      if (fileName.includes("행동") || fileName.includes("행특") || fileName.includes("종합"))
        fileTypeHint = "behavior";
      else if (fileName.includes("창체") || fileName.includes("자율") || fileName.includes("동아리") ||
        fileName.includes("봉사") || fileName.includes("진로"))
        fileTypeHint = "creative";
      else if (fileName.includes("교과") || fileName.includes("세특") || fileName.includes("과목"))
        fileTypeHint = "subject";
      else
        fileTypeHint = "creative"; // 기본: 창체

      // ── 헤더 행 탐색: '성명' / '이름' 셀이 있는 행 ──
      let headerRowIdx = -1, nameCol = -1;
      for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
        if (!jsonData[i]) continue;
        for (let j = 0; j < jsonData[i].length; j++) {
          const ct = String(jsonData[i][j] || "").replace(/\s+/g, "");
          if (ct === "성명" || ct === "이름") { nameCol = j; headerRowIdx = i; break; }
        }
        if (headerRowIdx !== -1) break;
      }
      if (headerRowIdx === -1 || nameCol === -1) continue;

      const headerRow = jsonData[headerRowIdx] || [];
      const subRow = jsonData[headerRowIdx + 1] || []; // 2단 서브헤더 (창체 등)

      // ── 서브헤더 여부 판단 ──
      // 다음 행에 숫자/학생명이 없고 헤더 키워드가 있으면 서브헤더로 간주
      let dataStartIndex = headerRowIdx + 1;
      {
        const sub = subRow.map(c => String(c || "").replace(/\s+/g, ""));
        const hasKeyword = sub.some(c => c === "구분" || c === "특기사항" || c === "활동내용" || c === "시간");
        const hasStudentName = sub.some(c => c.length >= 2 && /[가-힣]/.test(c) && ![
          "구분", "특기사항", "활동내용", "시간", "학기", "학년", "번호"
        ].includes(c));
        if (hasKeyword && !hasStudentName) dataStartIndex = headerRowIdx + 2;
      }

      // ── 헤더+서브헤더에서 컬럼 감지 ──
      let detectedType = fileTypeHint;
      let subjCol = -1, detailCol = -1, areaCol = -1, gradeYearCol = -1;

      const maxCols = Math.max(headerRow.length, subRow.length);
      for (let j = 0; j < maxCols; j++) {
        const h = String(headerRow[j] || "").replace(/\s+/g, "");
        const sub = String(subRow[j] || "").replace(/\s+/g, "");
        const combined = h + " " + sub;

        // 행특 내용 감지
        if (combined.includes("행동특성") || combined.includes("종합의견")) {
          detectedType = "behavior"; if (detailCol === -1) detailCol = j;
        }
        // 교과 과목 컬럼
        if (detectedType !== "behavior" && (h === "교과" || h === "과목" || h === "과목명" || h === "교과목" || h === "교과목명")) {
          detectedType = "subject"; subjCol = j;
        }
        // 세부능력
        if (detectedType !== "behavior" && combined.includes("세부능력")) {
          detectedType = "subject"; if (detailCol === -1) detailCol = j;
        }
        // 창체 영역/구분 — '구분'이나 '영역'이 있으면 behavior가 아닌 한 강제 creative
        if (h === "구분" || h === "영역" || h === "활동영역" || sub === "구분" || h.includes("창의적")) {
          if (detectedType !== "behavior") { detectedType = "creative"; areaCol = j; }
        }
        // 특기사항 (미설정 시)
        if (detailCol === -1 && (h === "특기사항" || sub === "특기사항" || h.includes("특기사항") || sub.includes("특기사항"))) {
          detailCol = j;
        }
        // 활동내용
        if (detailCol === -1 && (h === "활동내용" || sub === "활동내용")) detailCol = j;
        // 학기/학년 (행특)
        if ((h === "학기" || sub === "학기") && gradeYearCol === -1) gradeYearCol = j;
        if (h === "학년" && gradeYearCol === -1) gradeYearCol = j;
      }

      // ── 폴백: detailCol 여전히 -1이면 데이터에서 가장 긴 텍스트 컬럼 찾기 ──
      if (detailCol === -1) {
        for (let i = dataStartIndex; i < Math.min(jsonData.length, dataStartIndex + 5); i++) {
          const row = jsonData[i]; if (!row) continue;
          let maxLen = 0;
          for (let j = 0; j < row.length; j++) {
            const len = String(row[j] || "").length;
            if (len > maxLen) { maxLen = len; detailCol = j; }
          }
          if (detailCol !== -1) break;
        }
      }
      if (detailCol === -1) continue;

      // ── 데이터 추출: 성명 있으면 갱신, 빈 성명이면 직전 학생 계속 사용 ──
      let currentStudent = "";
      let extractedText = [];

      if (detectedType === "subject") {
        for (let i = dataStartIndex; i < jsonData.length; i++) {
          const row = jsonData[i]; if (!row) continue;
          const cn = String(row[nameCol] || "").replace(/\s+/g, "");
          if (cn) currentStudent = cn;
          if (!currentStudent || currentStudent !== tgt) continue;
          const subj = subjCol !== -1 ? String(row[subjCol] || "").trim() : "";
          const detail = String(row[detailCol] || "").trim();
          if (detail && detail.length > 2) extractedText.push(subj ? "[" + subj + "]\n" + detail : detail);
        }
        if (extractedText.length > 0)
          subjectInput.value = subjectInput.value
            ? subjectInput.value + "\n\n" + extractedText.join("\n\n")
            : extractedText.join("\n\n");

      } else if (detectedType === "creative") {
        const ag = { "자율": [], "동아리": [], "봉사": [], "진로": [], "기타": [] };
        for (let i = dataStartIndex; i < jsonData.length; i++) {
          const row = jsonData[i]; if (!row) continue;
          const cn = String(row[nameCol] || "").replace(/\s+/g, "");
          if (cn) currentStudent = cn;
          if (!currentStudent || currentStudent !== tgt) continue;
          const area = areaCol !== -1 ? String(row[areaCol] || "").trim() : "";
          const detail = String(row[detailCol] || "").trim();
          if (!detail || detail.length <= 2) continue;
          if (area.includes("자율")) ag["자율"].push(detail);
          else if (area.includes("동아리")) ag["동아리"].push(detail);
          else if (area.includes("봉사")) ag["봉사"].push(detail);
          else if (area.includes("진로")) ag["진로"].push(detail);
          else if (area) ag["기타"].push("[" + area + "]\n" + detail);
          else ag["기타"].push(detail);
        }
        let rt = [];
        if (ag["자율"].length > 0) rt.push("[자율]\n" + ag["자율"].join("\n\n"));
        if (ag["동아리"].length > 0) rt.push("[동아리]\n" + ag["동아리"].join("\n\n"));
        if (ag["봉사"].length > 0) rt.push("[봉사]\n" + ag["봉사"].join("\n\n"));
        if (ag["진로"].length > 0) rt.push("[진로]\n" + ag["진로"].join("\n\n"));
        if (ag["기타"].length > 0) rt.push(ag["기타"].join("\n\n"));
        if (rt.length > 0)
          creativeInput.value = creativeInput.value
            ? creativeInput.value + "\n\n" + rt.join("\n\n")
            : rt.join("\n\n");

      } else { // behavior
        for (let i = dataStartIndex; i < jsonData.length; i++) {
          const row = jsonData[i]; if (!row) continue;
          const cn = String(row[nameCol] || "").replace(/\s+/g, "");
          if (cn) currentStudent = cn;
          if (!currentStudent || currentStudent !== tgt) continue;
          const gd = gradeYearCol !== -1 ? String(row[gradeYearCol] || "").trim() : "";
          const detail = String(row[detailCol] || "").trim();
          if (detail && detail.length > 2) extractedText.push(gd ? "[" + gd + "학기]\n" + detail : detail);
        }
        if (extractedText.length > 0)
          behaviorInput.value = behaviorInput.value
            ? behaviorInput.value + "\n\n" + extractedText.join("\n\n")
            : extractedText.join("\n\n");
      }
    }
  }

  evalForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = {
      apiKey: (document.getElementById("api-key") || { value: "" }).value.trim(),
      university: document.getElementById("university").value.trim(),
      major: document.getElementById("major").value.trim(),
      grade: (document.getElementById("student-grade") || { value: "" }).value.trim(),
      class: (document.getElementById("student-class") || { value: "" }).value.trim(),
      number: (document.getElementById("student-number") || { value: "" }).value.trim(),
      name: (document.getElementById("student-name") || { value: "" }).value.trim(),
      courses: document.getElementById("courses").value.trim(),
      averageGrade: (document.getElementById("average-grade") || { value: "" }).value.trim(),
      achievementOnly: (document.getElementById("achievement-only") || { value: "" }).value.trim(),
      subjectRecords: document.getElementById("subject-records").value.trim(),
      creativeActivities: document.getElementById("creative-activities").value.trim(),
      behavioralRecords: document.getElementById("behavioral-records").value.trim()
    };
    if (!formData.university || !formData.major || !formData.apiKey) { alert("API 키, 목표 대학 및 지원 학과를 모두 입력하세요."); return; }
    evalForm.classList.add("processing");
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = "<span class='spinner' style='width:20px;height:20px;border-width:2px;margin:0;'></span> 심층 분석 중...";
    emptyState.classList.add("hidden");
    reportViewer.classList.add("hidden");
    loadingState.classList.remove("hidden");
    if (window.innerWidth <= 992) document.querySelector(".result-section").scrollIntoView({ behavior: "smooth" });
    try {
      const rawResponse = await generateAIReport(formData);
      console.log("Raw AI Response:", rawResponse); // 디버깅용 로그 추가

      // 견고한 JSON 추출 및 파싱
      let jsonString = rawResponse.trim();

      // 마크다운 블록 제거
      if (jsonString.startsWith("```")) {
        const match = jsonString.match(/^```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) jsonString = match[1];
      }

      const startIdx = jsonString.indexOf('{');
      const endIdx = jsonString.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
        jsonString = jsonString.substring(startIdx, endIdx + 1);
      }

      // JSON 구조 보정 (따옴표 내부의 실제 줄바꿈을 \n으로 변경)
      jsonString = jsonString.replace(/"([^"]*?)"/gs, (match, p1) => {
        return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
      });

      // JSON 파싱 시도
      let reportData;
      try {
        reportData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("JSON Parsing Error:", parseError.message);
        console.log("Failed JSON string:", jsonString);
        throw new Error("AI 응답 형식이 올바르지 않거나 분석 내용이 너무 깁니다. 다시 시도해 주세요. (상세: " + parseError.message + ")");
      }

      document.getElementById("overallScore").textContent = reportData.totalScore || 0;
      document.getElementById("overallText").innerHTML = marked.parse(reportData.overallEvaluation || "");
      document.getElementById("academicScore").textContent = reportData.competencies?.academic?.score || "-";
      document.getElementById("careerScore").textContent = reportData.competencies?.career?.score || "-";
      document.getElementById("communityScore").textContent = reportData.competencies?.community?.score || "-";

      // 산출식 표시 (선택사항: overallText 상단이나 별도 공간에 추가)
      if (reportData.calculationFormula) {
        const formulaDiv = document.createElement("div");
        formulaDiv.style.cssText = "font-size:0.85rem; color:var(--accent-primary); margin-bottom:15px; padding:10px; background:rgba(150,186,255,0.1); border-radius:6px; border-left:3px solid var(--accent-primary); line-height:1.4;";
        formulaDiv.innerHTML = "<strong>📊 점수 산출 방식:</strong><br>" + reportData.calculationFormula;
        const overallText = document.getElementById("overallText");
        overallText.prepend(formulaDiv);
      }
      const bindModal = (btnId, title, compData) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        btn.onclick = () => {
          const evidenceText = Array.isArray(compData.evidence) ? compData.evidence.map(e => "- " + e).join("\n") : (compData.evidence || "근거 자료가 없습니다.");
          document.getElementById("modalTitle").textContent = title + " 상세 분석";
          document.getElementById("modalBody").innerHTML =
            "<div style='background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;margin-bottom:20px;border-left:4px solid var(--accent-primary)'>" +
            "<h4 style='margin-top:0;color:#96baff;margin-bottom:8px'>평가 요약</h4>" + marked.parse(compData.evaluation || "평가 내용이 없습니다.") + "</div>" +
            (compData.scoreJustification ?
              "<div style='background:rgba(150,186,255,0.08);padding:15px;border-radius:8px;margin-bottom:20px;border-left:4px solid var(--success-color)'>" +
              "<h4 style='margin-top:0;color:var(--success-color);margin-bottom:8px'>점수 산출 근거</h4>" + marked.parse(compData.scoreJustification) + "</div>" : "") +
            "<div style='padding:0 5px'><h4 style='color:#96baff;margin-bottom:10px'>근거 활동 자료</h4>" + marked.parse(evidenceText) + "</div>";
          document.getElementById("analysisModal").classList.remove("hidden");
        };
      };
      if (reportData.competencies) {
        bindModal("btnAca", "학업역량", reportData.competencies.academic || {});
        bindModal("btnCar", "진로역량", reportData.competencies.career || {});
        bindModal("btnCom", "공동체역량", reportData.competencies.community || {});
      }

      lastReportData = reportData; // 전역 변수에 저장
      updatePrintArea(reportData);

      document.getElementById("modalCloseBtn").onclick = () => document.getElementById("analysisModal").classList.add("hidden");
      document.getElementById("analysisModal").onclick = (ev) => { if (ev.target === document.getElementById("analysisModal")) document.getElementById("analysisModal").classList.add("hidden"); };
      loadingState.classList.add("hidden");
      reportViewer.classList.add("hidden");
      document.getElementById("dashboardViewer").classList.remove("hidden");
    } catch (error) {
      console.error(error);
      const errBox = document.createElement("div");
      errBox.style.cssText = "color:var(--error-color);padding:20px;";
      errBox.innerHTML = "<h3>분석 중 오류가 발생했습니다.</h3><p>" + error.message + "</p><p>API 키의 유효성을 확인하세요.</p>";

      // dashboardViewer를 비우지 않고, 별도의 reportViewer를 활용해 에러 표시
      document.getElementById("dashboardViewer").classList.add("hidden");
      reportViewer.innerHTML = "";
      reportViewer.appendChild(errBox);
      reportViewer.classList.remove("hidden");
      loadingState.classList.add("hidden");
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = "<span class='btn-text'>다시 분석하기</span><span class='btn-icon'>✦</span>";
      evalForm.classList.remove("processing");
    }
  });

  async function generateAIReport(data) {
    const modelName = "gemini-2.5-flash"; // 원래 사용하던 최신 모델로 복구
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${data.apiKey}`;

    // 대학별 평가 기준 (가이드북 기반)
    const universityEvalCriteria = {
      "서울대학교": {
        factors: `
[서울대학교 2026학년도 학생부종합전형 평가 기준 — 가이드북 반영]

■ 핵심 평가 요소 3가지 (비율 미지정 — 정성적 종합평가)
1. 학업역량: 교과 성취도(수강인원·성적 추이 포함 정성 해석), 논리적 사고력, 탐구 활동, 전공관련 과목 이수·성취 수준, 세특 내용
2. 학업태도: 자기주도적 학습, 탐구 의지, 배움 열의, 진로 탐색 노력, 수업 참여도, 독서 역량
3. 학업 외 소양: 리더십, 협업, 책임감, 성실성·출결, 봉사·창체 활동, 행동특성 종합의견

■ 평가 주안점
   1. 정성적 종합평가 (가중치 없음) — 한 사람의 인격체로 종합 평가
   2. 다수 다단계 평가: 입학사정관 ~28명 + 교수 ~110명
   3. 고교 환경 고려: 학교 규모·교과 개설 현황 내 노력 중심
   4. 교과 이수 충실도: 핵심 권장과목·권장과목 이수 여부 중요
   5. 결과보다 과정: 성실·주도적 교육과정 이수 여부가 핵심
   6. 도전적 과목 선택 긍정: 소수 이수·고난도 과목 낮은 등급도 불이익 없음

■ 전형별 비율: 지역균형(서류70%+면접30%) / 일반(서류50%+면접·구술50%)
`,
        competencies: {
          academic: "학업역량(교과 성취도 정성적 해석·수강인원·성적 추이) + 학업태도(자기주도학습·탐구의지·독서역량)",
          career: "진로역량(전공관련 과목 이수·성취도·세특 내 진로 탐색·도전적 과목 선택)",
          community: "학업 외 소양(품성·리더십·협업·책임감·성실성·출결·봉사활동·행동특성)"
        },
        weights: { academic: 0.34, career: 0.33, community: 0.33 } // 정성평가 (균등)
      },
      "연세대학교": {
        factors: `
[연세대학교 2026학년도 학생부종합전형 서류평가 기준]

■ 반영 비율: 종합평가 Ⅰ(70%) = 학업역량+진로역량 / 종합평가 Ⅱ(30%) = 공동체역량

■ 학업역량(Ⅰ): 학업성취도(성적 변화 추이 중시), 학업태도(자기주도·목표의식), 탐구력(지적 호기심·문제해결)
■ 진로역량(Ⅰ): 전공관련 교과 위계적 이수, 전공관련 성취도, 진로탐색 활동경험(직접관련 아니어도 과정 중시)
■ 공동체역량(Ⅱ, 30%): 협업·소통, 나눔·배려, 성실성·규칙준수, 리더십, 학업·진로 과정 협력 활동 포함

■ 계열별 권장 과목: 수학/컴퓨터(미적분·기하·AI수학), 물리/기계(물리Ⅰ·Ⅱ·화학), 생명/의약(화학·생명과학Ⅰ·Ⅱ), 경영/경제(통계·수학), 인문/사회(독서·논리·토론)
■ 평가 주안점: 정성평가, 다각적 적용, 일관성·진정성, 고교 환경 내 노력
`,
        competencies: {
          academic: "학업역량(성적 변화 추이·전공관련 성취·학업태도·탐구력) — 종합평가 Ⅰ(70%)",
          career: "진로역량(전공관련 교과 위계적 이수·성취도·진로탐색활동) — 종합평가 Ⅰ(70%)",
          community: "공동체역량(협업·소통·나눔·배려·성실성·리더십) — 종합평가 Ⅱ(30%)"
        },
        weights: { academic: 0.35, career: 0.35, community: 0.30 } // 70(학+진) / 30(공)
      },
      "고려대학교": {
        factors: `
[고려대학교 2026학년도 수시 학생부종합전형 평가 기준]

■ 전형별 선발: 학업우수전형(서류100%·수능최저有) / 계열적합전형(서류100%(5배)→서류50%+면접50%·수능최저無)

■ 서류 역량 및 비율
   학업역량: 학업우수 50% / 계열적합 40% — (학업성취도·학업태도·탐구력)
   자기계발역량: 학업우수 30% / 계열적합 40% — (계열관련탐색노력·전공관련이수·진로탐색경험)
   공동체역량: 공통 20% — (협업·소통·나눔·배려·성실성·리더십)

■ 권장이수과목: 컴퓨터(기하·미적분), 생명/식품/화공(화학·생명과학Ⅰ·Ⅱ), 경영(미적분·확률통계·경제), 정치외교(정치와법·경제·사회문화)
■ 평가 주안점: 정성적 종합평가, 계열 적합성, 과목 선택·이수 과정, 다각적 종합평가
`,
        competencies: {
          academic: "학업역량(학업성취도·학업태도·탐구력) — 학업우수 50%/계열적합 40%",
          career: "자기계발역량(계열관련탐색·전공관련이수·진로탐색경험) — 학업우수 30%/계열적합 40%",
          community: "공동체역량(협업·소통·나눔·배려·성실성·리더십) — 공통 20%"
        },
        weights: { academic: 0.50, career: 0.30, community: 0.20 } // 학업우수 기준
      },
      "서강대학교": {
        factors: `
[서강대학교 2026학년도 학생부종합전형 서류평가 기준]

■ 전형: 서류 100% / 면접 없음 / 수능최저 없음 / 1000점 만점 정성평가

■ 4가지 역량 및 비율
   학업역량 (40%): 학업성취도, 탐구능력, 융합능력
   창의적 문제해결력 (10%): 비판적 사고, 적극적 태도
   공동체역량 (20%): 리더십, 소통·협업, 규칙준수, 나눔·배려
   성장가능성 (30%): 자기주도성, 교과이수과정, 경험 개방성, 목표 지속성

■ 서강가치 철학: 전공적합성보다 성장가능성 중시, 다양한 분야 탐구 경험 긍정, 다전공 제도 연계
■ 권장과목: 모집단위별 강제 지정 없음 — 주도적 과목 선택·심화 학습 과정 자체를 평가
■ 평가 주안점: 과정 중심, 정성적 종합평가, 성장가능성 강조 (학업40%+성장30%=70% 핵심)
`,
        competencies: {
          academic: "학업역량(학업성취도·탐구능력·융합능력) — 40%",
          career: "성장가능성(자기주도성·교과이수과정·경험개방성·목표지속성) + 창의적문제해결력 — 합산 40%",
          community: "공동체역량(리더심·소통·협업·규칙준수·나눔·배려) — 20%"
        },
        weights: { academic: 0.40, career: 0.40, community: 0.20 }
      },
      "한양대학교": {
        factors: `
[한양대학교 2026학년도 학생부종합전형 평가 기준 — 가이드북 반영]

■ 전형별 선발
   추천형: 서류 100% (학교장추천·수능최저: 국·수·영·탐 3개 합 7)
   서류형: 서류 100% (면접無·수능최저無)
   면접형: 1단계 서류100%(7배) → 2단계 70%+면접30% (수능최저無)
   자소서 미요구 — 학생부만으로 전 과정 평가

■ 4대 역량 (2026 개편)
   기초학업역량: 학업성취도(성적 추이·과목별 강점 종합), 교과목 이수 상황
   심층학업역량: 비판적 사고(합리적 분석), 창의적 사고(융합적 해결), 탐구 능력
   진로탐구역량: 계열적합성 중심 (특정 전공이 아닌 계열 차원 평가), 자기주도적 탐색·준비
   공동체역량: 소통·협업, 나눔·배려, 성장잠재력 (공식 직함 불문)

■ 횡단발굴평가: 1~3학년 전체 기록을 횡단하며 역량 근거 발굴
■ 면접형 방식: 공과대학(제시문 기반 비대면 녹화, 수리과학·논리), 사범대학(학생부 기반 대면)
■ 학폭 기재 시 2026부터 치명적 불이익 (감점 또는 부적격)

■ 평가 주안점
   1. 횡단발굴: 전체 기록속 역량 근거를 종합 발굴
   2. 계열적합성: 전공이 아닌 계열 차원의 준비도 중시
   3. 성장 과정·태도: 성취 수준보다 지적 성장 추이와 학업 태도
`,
        competencies: {
          academic: "기초학업역량(학업성취도·성적 추이·교과이수상황) + 심층학업역량(비판적·창의적 사고·탐구능력) — 횡단발굴평가",
          career: "진로탐구역량(계열적합성·자기주도 진로탐색·계열관련 교과이수과정) — 전공이 아닌 계열 차원 평가",
          community: "공동체역량(소통·협업·나눔·배려·리더십·성장잠재력) — 직함 불문"
        },
        weights: { academic: 0.40, career: 0.40, community: 0.20 } // 정성평가 기반 추정치
      },
      "중앙대학교": {
        factors: `
[중앙대학교 2026학년도 학생부종합전형 평가 기준 — 가이드북 반영]

■ 전형 종류 및 선발 방식 (수능최저 없음 — 공통)
   CAU융합형인재 (의학부 제외): 서류 100% 일괄 선발 (면접 없음)
   CAU융합형인재 (의학부): 1단계 서류100%(5배수) → 2단계 서류70%+면접30%
   CAU탐구형인재 (서울캠퍼스): 1단계 서류100%(4~5배수) → 2단계 서류70%+면접30%
   CAU탐구형인재 (다빈치캠퍼스): 서류 100% 일괄 선발

■ 평가 역량 및 전형별 비율 (3가지)

   1. 학업역량 (세부: 학업성취도·학업태도·탐구력)
      - CAU융합형: 50% / CAU탐구형: 40%
      - 중앙대 탐구력 중점: 단순 성적을 넘어 수업 중 생긴 궁금증을 스스로 확장하여 탐구한 과정을 매우 높게 평가

   2. 진로역량 (세부: 전공관련교과이수노력·전공관련교과성취도·진로탐색활동경험)
      - CAU융합형: 30% / CAU탐구형: 50%
      - 탐구형 특징: 특정 분야에 깊이 있는 탐구 경험 및 전공 관련 교과 이수 수준이 높은 학생에 유리

   3. 공동체역량 (세부: 협업·소통능력, 나눔·배려, 성실성·규칙준수, 리더십)
      - CAU융합형: 20% / CAU탐구형: 10%

■ 전형별 특성
   - CAU융합형: '학업성취도'와 '의사소통능력'에 더 큰 무게 → 교내 활동에 고르게 참여하고 학업 성취도가 우수한 모범생 유형
   - CAU탐구형: '탐구력'과 '전공 관련 교과 성취도'에 더 큰 무게 → 특정 분야 심층 탐구 경험이 있는 학생

■ 면접 평가 방식 (CAU탐구형 서울·의학부 해당)
   형식: 제출 서류(학생부) 기반 1:다 블라인드 면접 (10분 내외)
   - CAU탐구형: 학업준비도 60% + 전공계열 적합성 30% + 의사소통·인성 10% (탐구과정 실체 확인 중심)
   - CAU융합형 의학부: 학업준비도 40% + 학교생활충실도 40% + 의사소통·인성 20%

■ 모집단위별 권장 이수 과목
   - 수학/컴퓨터/AI: 미적분, 기하 (핵심), 확률과 통계, 인공지능 수학 (권장)
   - 전기전자/기계: 미적분, 기하, 물리학Ⅰ·Ⅱ (핵심), 화학Ⅰ·Ⅱ (권장)
   - 화학/신소재: 미적분, 화학Ⅰ·Ⅱ (핵심), 기하, 물리학Ⅰ (권장)
   - 의학부: 생명과학Ⅰ·Ⅱ, 화학Ⅰ·Ⅱ (핵심), 미적분, 기하 (권장)
   - 약학부: 화학Ⅰ·Ⅱ, 생명과학Ⅰ·Ⅱ (핵심), 기하, 수학과제탐구 (권장)
   - 인문계열: 전공 연계 사회 과목(경제·윤리·정치 등) + 국어·영어 기초학업능력

■ 평가 주안점
   1. 전형 선택 전략: 지원 전형(융합형 vs 탐구형)에 따라 학업역량(50%/40%) vs 진로역량(30%/50%) 비중이 크게 달라짐
   2. 탐구력 핵심: 성적 이상의 심화 탐구 과정과 지적 확장을 매우 중요하게 평가
   3. 수능최저 없음: 학생부의 '질적 관리'가 핵심, 특히 탐구형은 전공 탐구 깊이 증명이 필수
   4. 학폭 반영: 2026학년도부터 학교폭력 기재 사항이 평가에 불이익
`,
        competencies: {
          academic: "학업역량(학업성취도·학업태도·탐구력) — CAU융합형 50%/CAU탐구형 40%. 탐구력: 수업 중 궁금증을 자발적으로 확장·심화한 과정을 매우 높이 평가",
          career: "진로역량(전공관련교과이수노력·전공관련교과성취도·진로탐색활동경험) — CAU융합형 30%/CAU탐구형 50%. 탐구형 지원 시 특정 분야 심층 탐구 경험이 결정적",
          community: "공동체역량(협업·소통능력·나눔·배려·성실성·규칙준수·리더십) — CAU융합형 20%/CAU탐구형 10%"
        },
        weights: { academic: 0.50, career: 0.30, community: 0.20 } // 융합형인재 기준
      },
      "경희대학교": {
        factors: `
[경희대학교 2026학년도 학생부종합전형 평가 기준 — 가이드북(네오르네상스전형) 반영]

■ 전형별 선발 방식
   네오르네상스전형(학생부종합): 1단계 서류100%(3배수) → 2단계 1단계70%+면접30%
   지역균형전형(학생부교과): 교과성적 70% + 교과종합평가 30% (세특·성적 정성 평가만 반영)
   수능최저: 의예과·한의예과·치의예과·약학과 일부 학과만 적용 / 그 외 학과는 없음

■ 서류 평가 3가지 역량 및 반영 비율 (입학사정관 2인 정성 종합평가)
   학업역량 (40%):
     - 학업성취도: 전체 성적 추이 및 희망 전공 관련 과목 성취도, 선택과목의 적절성
     - 학업태도: 학업 수행의 자발적 의지와 열정, 수업 내 질문·탐구·독서 등 능동적 태도
     - 탐구력: 지적 호기심 기반 탐구 과정 및 문제해결 능력 (세특 내 수업 중 심화·확장 탐구 과정 중점)
   진로역량 (40%):
     - 교과 이수 노력: 전공 관련 핵심과목·권장과목 선택 및 이수 여부 (경희대 과목 선택 가이드 기준)
     - 교과 성취도: 전공 관련 과목의 성취 수준 및 세특 기재 내용의 질
     - 진로 탐색 활동: 관심 분야에 대한 꾸준하고 일관된 탐색·경험 과정과 진정성
     ※ 자율·자유전공학부 지원 시: '진로역량' → '자기주도역량'으로 대체 평가
       (특정 전공 미국한, 폭넓은 탐색·주도적 학습 태도 중점)
   공동체역량 (20%):
     - 협업·소통: 팀 활동 내 역할·조율·의사소통 능력
     - 나눔·배려: 봉사 활동 및 실질적 배려 실천
     - 성실성·규칙준수: 출결 상황 및 책임감
     - 리더십: 구성원 화합을 이끌어내는 능력

■ 면접 평가 기준 (2단계, 10분 내외 / 학생부 기반 블라인드 개별 면접)
   인성 (50%): 가치관 및 태도(창의적 노력·진취적 기상·건설적 협동) + 의사소통능력(공감·표현력)
   전공적합성 (50%): 전공 기초소양(전공에 대한 관심·이해 수준) + 논리적 사고력

■ 평가 척도: S(탁월)~F(미달) 6단계 정성 평가
   탁월성(S) 핵심 지표: 수업 내 지적 호기심 → 자기주도적 확장 → 심화 탐구의 연결고리
   → '동기-과정-결과-성장'의 스토리와 세특의 질적 깊이가 최우선 기준
   → 단순 활동 나열·결과 제시는 낮은 평가, 탐구의 진정성·과정·깊이가 본질

■ 지역균형전형 교과종합평가 주안점
   - 교과학습발달상황(성적+세특)만을 대상으로 정성 평가
   - 성취도뿐 아니라 세특 내 학업 태도·탐구 과정·자기주도성을 함께 반영

■ 모집단위별 핵심·권장 과목 (진로역량 평가에 직접 영향)
   수학·물리·컴퓨터 관련: 미적분, 기하 (핵심), 확률과 통계, AI수학 (권장)
   생명·화학 관련: 화학Ⅰ·Ⅱ, 생명과학Ⅰ·Ⅱ (핵심)
   의·한의·치의예과: 생명과학Ⅰ·Ⅱ, 화학Ⅰ·Ⅱ (핵심), 미적분, 기하 (권장)
   약학과: 화학Ⅰ·Ⅱ, 생명과학Ⅰ·Ⅱ (핵심), 기하, 수학과제탐구 (권장)
   인문·사회계열: 전공 연계 사회과목(경제·정치·윤리 등) + 국어·영어 기초학업역량

■ 평가 주안점 (종합)
   1. 서류 핵심 균형: 학업역량(40%)과 진로역량(40%)이 동일 비중 — '수업 속 탐구'가 두 역량을 동시에 증명
   2. 탁월성 기준: 성적(결과)보다 동기-과정-결과-성장의 내러티브와 세특의 질적 깊이
   3. 면접 전공적합성 50%: 선택한 전공에 대한 관심과 이해를 논리적으로 설명할 수 있어야 함
   4. 일관성과 진정성: 특정 분야에 대한 지속적이고 진정성 있는 관심 흐름이 중요
   5. 과목 선택 전략: 핵심과목 이수 여부가 진로역량 점수에 직접적인 영향을 미침
   6. 교과종합평가(지역균형): 세특의 질적 내용이 성적 그 자체만큼 중요
`,
        competencies: {
          academic: "학업역량(학업성취도·학업태도·탐구력) — 40%. 탁월성 기준: 수업 내 지적 호기심을 자기주도로 심화·확장한 탐구 과정('동기-과정-결과-성장')과 세특의 질적 깊이",
          career: "진로역량(전공관련 핵심·권장과목 이수 여부·교과 성취도·진로탐색 일관성과 진정성) — 40%. 지원 학과의 핵심과목 이수가 진로역량 점수에 결정적 영향",
          community: "공동체역량(협업·소통·나눔·배려·성실성·규칙준수·리더십) — 20%. 면접(인성 50%+전공적합성 50%): 가치관·의사소통·전공 이해 및 논리적 사고력 평가"
        },
        weights: { academic: 0.40, career: 0.40, community: 0.20 }
      },
      "한국외국어대학교": {
        factors: `
[한국외국어대학교 2026학년도 학생부종합전형 평가 기준 — 가이드북(면접형·서류형) 반영]

■ 전형별 선발 방식
   면접형 / SW인재전형:
     1단계: 서류100% (3배수 선발)
     2단계: 1단계 성적 50% + 면접평가 50%
   서류형 / 기회균형전형:
     일괄합산: 서류100% (면접 없음)
   수능 최저: 학생부종합전형(면접형·서류형) 모두 수능 최저학력기준 없음

■ 서류 평가 역량별 반영 비율 (전형에 따라 달라짐)
   [면접형 / SW인재]
     진로역량 50% > 학업역량 30% > 공동체역량 20%
     → 진로역량 가중: 전공 관련 탐색과 경험이 핵심인 학생에 유리
   [서류형 / 기회균형]
     학업역량 50% > 진로역량 30% > 공동체역량 20%
     → 학업 성취와 탐구력이 강점인 학생에 유리

■ 서류 평가 3가지 역량 세부 항목 (입학사정관 정성 종합평가)
   학업역량:
     - 학업성취도: 교과 성적 추이 및 과목별 성취 수준
     - 학업태도: 학업에 대한 자발적 의지, 자기주도적 노력
     - 탐구력: 지적 호기심을 바탕으로 깊이 있게 탐구하고 문제를 해결하는 능력
   진로역량:
     - 전공(계열) 관련 교과 이수 노력: 전공 관련 과목 선택의 적절성 및 이수 노력
     - 전공(계열) 관련 교과 성취도: 전공 관련 과목의 학업 성취 수준
     - 진로 탐색 활동과 경험: 다양한 활동을 통한 진로 탐색 과정 및 경험의 깊이
   공동체역량:
     - 협업과 소통능력, 나눔과 배려, 성실성과 규칙준수, 리더십

■ 면접 평가 기준 (면접형 2단계 / 10분 내외 / 학생부 기반 2:1 블라인드 개별면접)
   학업역량 (40%): 학업 성취와 탐구력에 대한 논리적 설명 능력
   진로역량 (40%): 전공에 대한 관심·이해, 진로 탐색 과정의 진정성 확인
   공동체역량 (20%): 소통 능력, 협업 경험, 인성·태도
   ※ 면접 언어: 전 과정 한국어로만 진행 (외국어 능력 평가 아님)
   ※ 공통 질문 없음 — 학생부 내용 기반 개인별 맞춤 질문
   ※ 주안점: 서류(생기부) 진위 확인 + 논리적 사고력 + 소통 능력 + 전공 관심도

■ 탁월성 판단 기준 (입학사정관 관점)
   - 교과 간 지식의 전이(Transference): 한 과목에서 배운 개념을 다른 과목이나 분야에 연결·적용
   - 자기주도적 심화 탐구: 교과서 내용을 넘어 스스로 주제를 설정하고 깊이 있게 탐구한 과정
   - 주도적 리더십: 단체 활동에서 갈등 해결·목표 달성을 위해 주도적 역할을 수행한 구체적 경험
   - 학생부 전체를 유기적으로 연결하여 일관성·진정성을 확인

■ 계열별 권장 이수 과목 (전공가이드북 기반)
   외국어계열 (영미·유럽·아시아·중동 등): 영어·국어 핵심 역량, 제2외국어 관련 과목 이수
     권장: 독서, 언어와 매체, 현대문학, 영어권 문화·문학, 제2외국어 심화
   사회·국제통상계열: 사회·문화, 정치와 법, 경제, 세계지리 (핵심), 국제관계 관련 탐구
   AI·디지털 융합계열 (Language&AI, AI데이터사이언스, Finance&AI):
     미적분, 기하, 확률과 통계 (핵심), 인공지능 수학, 정보, 데이터 과학 (권장)
   자연·통계계열 (수학·통계): 미적분, 기하, 확률과 통계 (핵심), 수학과제탐구 (권장)
   공통: 단순 과목 이수보다 해당 과목에서 수행한 탐구 활동의 깊이와 과정이 중요

■ 평가 주안점 (종합)
   1. 전형 선택 전략: 진로역량이 강하면 면접형(진로50%), 학업이 강하면 서류형(학업50%)이 유리
   2. 진로 일관성: 외국어·국제·AI 등 희망 분야에 대한 지속적이고 일관된 관심 흐름이 핵심
   3. 세특의 질 vs 양: 교과 간 연결(지식 전이)과 자발적 심화 탐구 과정이 탁월성의 기준
   4. 면접형 전략: 서류에서 진로역량(50%)을 먼저 높이고, 면접에서 생기부 내용을 논리적으로 설명·확증
   5. 수능최저 없음: 학생부 콘텐츠의 질적 관리가 전략의 전부
   6. 공동체역량: 비율은 20%이지만 리더십 경험이 면접에서 구체적인 질문 소재로 활용됨
`,
        competencies: {
          academic: "학업역량(학업성취도·학업태도·탐구력) — 면접형 30%/서류형 50%. 탁월성: 교과 간 지식 전이, 자기주도 심화 탐구 과정이 핵심 평가 지표",
          career: "진로역량(전공관련 교과 이수 노력·성취도·진로탐색 활동경험) — 면접형 50%/서류형 30%. 외국어·AI·국제통상 분야에 대한 일관된 관심과 탐구 진정성이 결정적",
          community: "공동체역량(협업·소통·나눔·배려·성실성·리더십) — 공통 20%. 면접(학업40%+진로40%+공동체20%): 한국어 개별 맞춤 질문으로 서류 진위·논리·소통 능력 확인"
        },
        weights: { academic: 0.30, career: 0.50, community: 0.20 } // 면접형 기준
      },
      "서울시립대학교": {
        factors: `
[서울시립대학교 2026학년도 학생부종합전형 평가 기준 — 가이드북 반영]

■ 전형 유형 및 선발 방식
   학생부종합전형Ⅰ (면접형):
     1단계: 서류평가 100% (3배수 선발)
     2단계: 서류평가 50% + 면접평가 50%
     수능 최저: 없음
     ※ 대부분의 모집단위 해당, 면접 비중(50%)이 매우 높아 면접의 영향력이 결정적
   학생부종합전형Ⅱ (서류형):
     일괄합산: 서류평가 100% (면접 없음)
     수능 최저: 국·수·영·탐(1) 중 2개 영역 등급 합 5 이내 + 한국사 4등급 이내
     ※ 2026 기준 경영학부 등 일부 모집단위 해당

■ UOS 3대 역량 및 전형별 반영 비율
   [학생부종합전형Ⅰ — 면접형]
     잠재역량 40% > 학업역량 35% > 사회역량 25%
   [학생부종합전형Ⅱ — 서류형]
     잠재역량 50% > 학업역량 30% > 사회역량 20%
   ※ 동점자 처리 우선순위: 잠재역량 > 학업역량 > 사회역량 — 잠재역량이 가장 중요

■ 3대 역량 세부 평가 기준 (정성적 종합평가)
   학업역량 (Academic):
     - 고교 기초 학업능력: 3년간 성적 추이(상승세), 원점수, 이수자 수, 교육 환경 종합 고려
     - 대학 전공 기초소양: 지원 전공 관련 교과목 이수 현황과 성취도
     - 단순 내신 등급이 아닌 학교 여건을 감안한 정성적 해석 중시
   잠재역량 (Potential) ← 가장 변별력이 큰 항목:
     - 다학제적 전공수학 열의: 모집단위(학과)별 인재상에 부합하는 탐구 활동 2~3가지
     - 통합적 문제해결 역량: 자기주도적 문제해결 과정과 전공에 대한 깊은 호기심
     - 탐구의 깊이: 하나의 주제를 깊이 파고들어 결론 도출 또는 후속 활동으로 이어진 사례
     - 전공 관련 핵심 교과목을 충실히 이수하고 그 수업에서 보인 지적 확장 과정
   사회역량 (Social):
     - 공동체 및 시민윤리의식: 협동학습능력, 책임감
     - 협업과 리더십: 공동체 내 주도적 협업, 타인에 대한 배려
     - 형식적 봉사 시간보다 활동 과정에서 본인이 미친 긍정적 영향력에 주목

■ 면접 평가 기준 (학생부종합Ⅰ 2단계 / 12분 내외 / 2:1 개별 블라인드 면접)
   평가 요소: 종합적 사고력, 문제해결능력, 의사소통능력, 공정윤리의식, 서류 진실성
   주안점: 학생부 내용 확인 면접 — 단순 활동 나열보다 당시의 고민·배운 점·전공 지식과의
           연결을 깊이 있게 질문. 서류 진위 확인과 지원자의 논리적 사고력을 동시에 평가

■ 탁월성 판단 기준 (A등급 수준)
   - 단일 주제 심화: 하나의 주제를 깊이 있게 탐구하여 결론을 도출하거나 후속 탐구로 연결
   - 전공 적합성 명확: 모집단위 인재상에 직접적으로 부합하는 활동 2~3가지가 학생부에 뚜렷
   - 교과 이수 충실도: 전공 핵심 교과(공학계열은 미적분·물리, 상경계열은 경제·확통 등) 이수
   - 학과별 인재상과 학생부 활동의 유기적 일치성

■ 모집단위별 권장 이수 과목 (전공가이드북 기반)
   공학·자연계열: 수학(미적분, 기하) + 과학(물리학Ⅱ, 화학Ⅱ 등) + 정보
   인문·상경계열: 수학(확률과 통계, 미적분) + 사회(경제, 사회·문화, 정치와 법)
   도시과학계열: 수학 + 사회(세계지리, 사회·문화) + 과학(물리, 지구과학 등)
   AI·컴퓨터계열: 수학(미적분, 기하, 확률과 통계) + 정보 + 인공지능 수학

■ 평가 주안점 (종합)
   1. 학과별 인재상 최우선: 서울시립대는 학과가 직접 정한 인재상을 평가 척도로 활용
      → 지원 학과의 '모집단위별 인재상'을 반드시 확인하고 활동과 연결 필수
   2. 잠재역량이 공통 1순위: 면접형(40%)·서류형(50%)·동점자 처리 모두 잠재역량이 가장 중요
   3. 탐구의 깊이 vs 개수: 활동의 양보다 하나를 깊게 파고든 흔적이 탁월성의 핵심
   4. 면접형 전략: 2단계 면접이 50% → 서류에서 잠재역량을 확보하고 면접에서 논리적으로 설명
   5. 서류형(경영학부 등): 수능 최저 충족이 전제 조건 + 잠재역량(50%) 집중 관리 필요
   6. 성적 추이: 단순 등급보다 3년간 상승세와 전공 관련 교과 성취도를 중시
`,
        competencies: {
          academic: "학업역량(고교 기초 학업능력·전공 기초소양) — 면접형 35%/서류형 30%. 3년 성적 추이·원점수·이수자 수·전공 관련 교과 이수 현황을 정성적으로 종합 해석",
          career: "잠재역량(다학제적 전공수학 열의·통합적 문제해결 역량) — 면접형 40%/서류형 50%. 학과별 인재상 부합 탐구 활동 2~3가지, 깊이 있는 단일 주제 심화 탐구가 탁월성 기준",
          community: "사회역량(공동체·시민윤리의식·협동학습능력·리더십·배려) — 면접형 25%/서류형 20%. 형식적 봉사보다 공동체 내 긍정적 영향력과 주도적 협업 경험 중시"
        },
        weights: { academic: 0.35, career: 0.40, community: 0.25 } // 면접형 기준
      },
      "건국대학교": {
        factors: `
[건국대학교 2026학년도 학생부종합전형 평가 기준 — 가이드북(KU자기추천) 반영]

■ 전형 유형 및 선발 방식
   KU자기추천 (대표 학생부종합전형):
     1단계: 서류평가 100% (모집인원의 3배수 선발)
     2단계: 1단계 성적 70% + 면접평가 30%
     수능 최저: 없음
   사회통합·기초생활·특성화고 등:
     서류평가 100% 일괄합산 (면접 없음)

■ 평가 역량 및 반영 비율 (모집단위에 따라 다름)
   [학과(부) 모집 — 일반 전공]
     진로역량 40% > 학업역량 30% = 공동체역량 30%
     → 전공 관련 교과 이수·성취도와 진로 탐색 경험이 가장 중요
   [KU자유전공학부 — 전공자율선택제]
     성장역량 50% > 공동체역량 30% > 학업역량 20%
     → 특정 전공 적합성 대신 성장 잠재력(성장역량)을 절반 이상 반영

■ 3가지 역량 세부 평가 항목 (입학사정관 정성 종합평가)
   학업역량 (Academic):
     - 학업성취도: 교과 성적 추이 및 과목별 성취 수준
     - 학업태도: 수업 내 지적 호기심과 자기주도적 학습 의지
     - 탐구력: 지적 호기심을 해결하기 위한 탐구 과정이 세특에 구체적으로 기재된 정도
   진로역량 (Career / 학과부 전용):
     - 전공(계열)관련 교과 이수 노력: 지원 학과 관련 과목 선택·이수 여부, 교과 위계 준수
     - 전공(계열)관련 교과 성취도: 전공 관련 과목의 학업 성취 수준
     - 진로 탐색 활동과 경험: 지원 학과에 대한 지속적 관심과 탐색 과정의 진정성
   성장역량 (Growth / KU자유전공학부 전용):
     - 자기주도성: 스스로 활동을 기획하고 확장해 나가는 주도적 태도
     - 창의적 문제해결력: 스스로 문제를 정의하고 창의적으로 해결하려는 과정
     - 경험의 다양성: 특정 전공에 국한되지 않는 폭넓은 분야의 탐색과 경험
   공동체역량 (Community):
     - 협업과 소통능력, 나눔과 배려, 성실성과 규칙준수, 리더십
     - 형식적 봉사시간·직책보다 실제 공동체 내 타인 배려·협력·긍정적 변화의 구체적 에피소드

■ 면접 평가 기준 (KU자기추천 2단계 / 10분 내외 / 면접관 2인 vs 지원자 1인 블라인드 면접)
   평가 척도: 5등급 (A+, A, B, C, D)
   학과부 모집: 진로역량(40%)이 가장 높은 비중 — 전공 관련 탐구 경험의 진정성 확인 중심
   KU자유전공학부: 성장역량(50%)이 절반 이상 — 자기주도성·경험의 다양성 확인 중심
   면접 주안점: 서류(학생부) 기반 확인 면접, 탐구의 동기·과정·어려움·해결 방안 심층 질문

■ 탁월성(A+) 판단 기준
   - 탐구의 깊이: 교과서 개념을 넘어 관련 논문·도서 탐독 또는 직접 실험·설문 설계 후 심화 탐구
   - 과정 중심의 기록: 결과보다 '왜 탐구했는지', '어떤 어려움이 있었고 어떻게 해결했는지'가 생생히 기재
   - 자기주도성: 교사가 시킨 활동이 아닌 본인 관심사 기반으로 스스로 기획·확장한 활동

■ 전공별 권장 이수 과목
   수의예과: 생명과학Ⅰ·Ⅱ, 화학Ⅰ·Ⅱ 등 자연과학 핵심 과목 필수
   공과대학: 수학(미적분, 기하) + 물리학Ⅰ·Ⅱ 등 기초 과학 충실도 확인
   사범대학: 지원 전공 관련 교과 + 교육학적 소양·멘토링 활동 경험 중시
   KU자유전공학부: 특정 과목 지정 없음 — 다양한 분야 탐색 경험의 스펙트럼이 중요

■ 평가 주안점 (종합)
   1. 전공 선택에 따라 적용 역량이 다름: 학과부(진로역량40%) vs 자유전공(성장역량50%)
   2. 세특의 과정 기록: '왜·어떻게'가 담긴 세특 내용이 탁월성(A+)의 핵심 판단 기준
   3. 수능최저 없음: 학생부 콘텐츠의 질과 면접 준비가 합격을 좌우
   4. 면접 30% 비중: 1단계 통과 후 세특 기반 심층 질문에 답할 수 있어야 함
   5. 진로역량 위계 이수: 지원 학과 관련 교과의 단계적·위계적 선택·이수가 평가에 유리
   6. 공동체역량은 '에피소드'로 평가: 형식적 활동보다 구체적 스토리가 있는 협력 경험 필수
`,
        competencies: {
          academic: "학업역량(학업성취도·학업태도·탐구력) — 학과부 30%/자유전공 20%. 세특에 지적 호기심과 탐구 과정이 구체적으로 기재된 정도가 핵심",
          career: "진로역량(전공관련 교과 이수 노력·성취도·진로탐색경험) — 학과부 40%. 지원 학과 관련 위계적 교과 이수와 진정성 있는 탐색 과정이 결정적 / KU자유전공: 성장역량(자기주도성·창의적 문제해결·경험 다양성) — 50%",
          community: "공동체역량(협업·소통·나눔·배려·성실성·리더십) — 공통 30%. 형식적 봉사보다 실제 공동체 내 긍정적 변화 이끈 구체적 에피소드 중시"
        },
        weights: { academic: 0.30, career: 0.40, community: 0.30 } // 일반 학과부 기준
      },
      "동국대학교": {
        factors: `
[동국대학교 2027학년도 학생부종합전형 평가 기준 — 가이드북(Do Dream 전형) 반영]

■ 전형 유형 및 선발 방식
   Do Dream (대표 학생부종합전형):
     1단계: 서류평가 100% (3.5~4배수 선발)
     2단계: 1단계 성적 70% + 면접평가 30%
     수능 최저: 없음
   학교장추천인재 (학생부교과):
     교과 성적 70% + 서류 종합평가(정성) 30%
     교과 전형임에도 서류 정성평가 30%가 당락에 큰 영향 — 학업역량 50% > 진로역량 30% > 인성사회성 20%
   불교추천인재: 전공적합성 25% + 불교정신소양 30% + 학업역량 25% + 인성사회성 20%
   기타(기회균형 등): Do Dream과 유사한 단계별 전형 방식

■ Do Dream 평가 역량 및 반영 비율
   전공적합성 55% (=최우선, 타 대학보다 압도적으로 높음):
     - 전공수학역량 30%: 전공 관련 핵심 과목 이수 여부와 성취도
     - 전공관심도·진로탐색노력 25%: 동아리·진로활동에서 전공에 대한 고민 구체화 및 지속 활동
   학업역량 25%:
     - 기초학업역량 15%: 국·수·영·사/과 기본 교과 성취도 및 추이
     - 학습의 주도성 10%: 지적 호기심 해결을 위한 노력, 교과 수업 내 심화 탐구 과정
   인성 및 사회성 20%:
     - 역할의 주도성 10%: 공동체 내 리더십·갈등 조율 주도 경험
     - 협업소통능력 10%: 타인 의견 경청 및 협력을 통한 문제 해결

■ 역량별 세부 평가 주안점
   전공적합성 (최우선 — Do Dream 55%):
     - 전공 수학역량: 전공 관련 핵심 과목을 실제로 이수하고 높은 성취를 보였는지
     - 진로 탐색 노력: 동아리·진로활동·자율활동에서 전공 관련 고민이 구체화·지속되었는지
     - 수업 속 전공 탐구: 세특에서 전공 분야 개념을 깊이 다루거나 스스로 확장한 사례
   학업역량:
     - 기초학업: 단순 등급 수치보다 성취도와 수업 태도, 3년 추이를 정성 평가
     - 학습 주도성: 지적 호기심을 스스로 해결하기 위한 탐구 과정이 세특에 구체적으로 기재
   인성 및 사회성:
     - '참여' 수준을 넘어 조직 방향성 제시·적극적 중재자로 활동한 기록이 구체적일 때 고득점

■ 면접 평가 기준 (Do Dream 2단계 / 10분 내외 / 학생부 기반 서류 확인 면접)
   전형취지적합성 20% + 전공적합성 30% + 발전가능성 20% + 인성 및 사회성 30%
   주요 질문 방향:
     - 세특 기재 탐구 활동의 실제 수행 여부 및 깊이 확인
     - 전공 기본 소양 및 논리적 사고력 테스트
     - '계기-과정-결과-성장' 연결성 중심의 심층 질문 (단순 활동 나열 제외)

■ 탁월성(A+) 판단 기준 (6단계: A+, A, B, C, D, F)
   - 지적 호기심의 확장: 수업에서 배운 개념에 의문을 품고 문헌 탐독·실험 설계 등 '꼬리 무는 탐구'
   - 교과 연계성: 교과 성적과 세특 내용이 일치하고 전공 관련 핵심 과목에서 특히 우수한 역량
   - 주도적 사회성: '참여'를 넘어 조직 방향성 제시·적극적 중재자 역할이 구체적으로 기록
   - 전공 수업 속 탐구가 핵심: '수업 시간 내 활동(세특)'에서 드러나는 전공 깊이 있는 고민을 최우선 평가

■ 계열별 권장 이수 과목 (전공가이드북 기반)
   인문계열: 국어(화작, 언매), 사회(생윤·윤사·사문·세계사 등), 제2외국어
   경영·경제계열: 수학(수Ⅰ·Ⅱ, 확통, 미적분), 사회(경제, 사문)
   자연·공학계열: 수학(미적분, 기하) 필수 + 과학(물리학Ⅰ·Ⅱ, 화학Ⅰ·Ⅱ 등 전공 연계)
   바이오·메디컬: 생명과학Ⅰ·Ⅱ, 화학Ⅰ·Ⅱ 성취도 중요
   열린전공(무전공): 특정 분야 치우침 없이 전 계열 기초 학업역량 + 폭넓은 탐구 의지

■ 평가 주안점 (종합)
   1. 전공적합성이 55%로 압도적 1순위: 전공 관련 핵심 과목 이수와 심화 탐구가 합격의 핵심
   2. 수능최저 없음: 학생부 세특의 질과 면접 준비가 전부
   3. 면접 전공적합성 30%: 전공 관련 탐구 경험을 '계기-과정-결과-성장'으로 논리적 설명 필수
   4. 학교장추천(교과전형): 정성평가 30%에서 학업역량(50%) 중심 — 성적+세특 관리 병행 필요
   5. 세특 중심 평가: 외부 활동보다 '수업 시간 내 탐구'가 동국대 평가의 핵심 판단 근거
   6. 자연·공학계열: 미적분·기하 이수가 전공수학역량 평가에 결정적 영향
`,
        competencies: {
          academic: "학업역량(기초학업역량·학습주도성) — Do Dream 25%/학교장추천 50%. 세특에 드러나는 지적 호기심 해결 탐구 과정, 3년 성취도 추이 정성 평가",
          career: "전공적합성(전공수학역량 30%+전공관심도·진로탐색노력 25%) — Do Dream 55%. 전공 핵심 과목 이수·성취도와 세특의 전공 관련 심화 탐구가 합격의 핵심 결정 요소",
          community: "인성 및 사회성(역할주도성 10%+협업소통 10%) — Do Dream 20%. 면접 인성 30%: '계기-과정-결과-성장' 연결성 심층 질문, 구체적 主導 경험 중시"
        },
        weights: { academic: 0.25, career: 0.55, community: 0.20 } // Do Dream 전형 기준
      },
      "홍익대학교": {
        factors: `
[홍익대학교 2026학년도 학생부종합전형 평가 기준 — 가이드북 반영]

■ 전형 유형 및 선발 방식
   학교생활우수자 (인문·자연계열):
     서류평가 100% 일괄합산 (면접 없음)
     수능 최저 [서울캠퍼스]: 국·수·영·탐(1) 중 3개 영역 등급 합 8 이내 + 한국사 4등급 이내
     수능 최저 [세종캠퍼스]: 국·수·영·탐(1) 중 2개 영역 등급 합 9 이내
     ※ 수능 최저가 있으므로 실질 경쟁률이 낮아 서류 준비와 함께 수능 관리 병행 필수
   미술우수자 (미술계열):
     1단계: 교과 20% + 서류 80% (3배수 선발)
     2단계: 서류 40% + 면접 60%
     수능 최저 [서울]: 국·수·영·탐(1) 중 3개 영역 등급 합 9 이내 + 한국사 4등급 이내

■ 평가 요소 및 반영 비율 (학교생활우수자 서류평가 기준)
   학업역량 (40%): 대학 교육 이수에 필요한 기초 학업 능력
   진로역량 (40%): 자신의 진로와 전공(계열)에 대한 탐색 노력과 준비 정도
   공동체역량 (20%): 공동체의 일원으로서 갖추어야 할 바람직한 사고와 행동

■ 역량별 세부 평가 항목
   학업역량 (40%):
     - 기초학업성취도: 전반적 교과 성적 및 전공 관련 과목의 성취 수준
     - 학업태도: 학업 수행의 자발적 의지와 노력 (자기주도성)
     - 탐구력: 지적 호기심을 바탕으로 사물·현상을 탐구하고 문제를 해결하려는 능력
   진로역량 (40%):
     - 전공(계열) 관련 교과 이수 노력: 전공에 필요한 과목을 선택·이수한 정도
     - 전공(계열) 관련 교과 성취도: 전공 관련 과목의 학업 성취 수준
     - 진로 탐색 활동과 경험: 관심 분야에 대한 지속적 탐색 과정과 결과
   공동체역량 (20%):
     - 협업 및 소통능력: 공동 목표를 위한 협력과 타인 의견 경청
     - 나눔과 배려: 타인을 이해하고 돕고자 하는 마음가짐
     - 성실성 및 규칙준수: 책임감 기반의 의무 수행과 사회적 규범 준수
     - 리더십: 공동체 목표 달성을 위해 구성원의 화합과 변화를 이끄는 능력

■ 미술우수자 면접 평가 기준 (2단계 / 60% 반영 — 실질 영향력 매우 높음)
   평가 항목: 미술 관련 소양, 창의성, 표현 능력, 미술활동보고서 진실성
   방식: 면접 전 약 24분 문제 풀이·준비 → 면접위원 다수 : 수험생 1명, 약 12분 진행
   내용: 조형 능력 평가(드로잉 등) + 미술활동보고서 기반 질의응답 결합 형태

■ 평가 주안점
   1. 학업의 깊이: 교과 성적의 높고 낮음보다 수업 내 지적 호기심을 어떻게 심화 탐구로 연결했는지
   2. 기록의 연계성: 1학년부터 3학년까지 전공에 대한 관심이 어떻게 변모·심화되었는지 '맥락' 확인
   3. 미술계열 특이사항: 미술활동보고서에서 예술적 소양·창의성·문제 해결 과정을 구체적으로 기술 필수
   4. 수능최저 관리: 인문·자연계열은 서류 준비와 수능 3개 영역 합 8 관리가 동시에 필요

■ 탁월성(A) 판단 기준 (5~7단계 척도)
   탁월(A): 문제 의식을 스스로 발견하고 독서·실험·토론 등 다양한 매체·활동으로 독창적 해결책 도출
   보통(C): 주어진 교육과정 내 활동에 충실 참여했으나 주제 확장·심화 노력이 부족

■ 계열별 권장 이수 과목
   인문계열: 국어, 영어, 사회 관련 심화과목 (경제, 정치와 법, 사회문화 등)
   자연계열: 수학(미적분, 기하), 과학(물리학·화학·생명과학 중 전공 밀접 과목) 위계적 이수
   미술계열: 미술 창작·미술사·드로잉 등 예체능 교과 + 국어·영어·사회 기초 역량

■ 평가 주안점 (종합)
   1. 학업·진로 동일 비중(각 40%): 학업성취와 전공 관련 탐색이 동등하게 중요
   2. 수능최저 전략: 인문·자연계열 서울캠퍼스는 3개 합 8이 필수 — 내신 관리와 수능 준비 병행
   3. 미술계열 면접 60%: 2단계에서 면접이 당락을 좌우 — 미술활동보고서와 조형 능력 집중 준비
   4. 진로역량의 일관성: 1~3학년 전반에 걸친 전공 관심의 흐름과 맥락이 핵심 판단 기준
   5. 서류 100% 전형(인문·자연): 세특·창체·행특의 전공 연계 탐구 기록이 합격의 전부
`,
        competencies: {
          academic: "학업역량(기초학업성취도·학업태도·탐구력) — 40%. 교과 성적보다 수업 내 지적 호기심을 심화 탐구로 연결한 과정, 1~3학년 연계성 있는 맥락 확인",
          career: "진로역량(전공관련 교과 이수 노력·성취도·진로탐색활동과 경험) — 40%. 전공에 대한 1~3학년 관심 심화 흐름의 맥락과 일관성이 탁월성 핵심 판단 기준",
          community: "공동체역량(협업·소통·나눔·배려·성실성·리더십) — 20%. 미술계열: 미술우수자 면접 60%(창의성·조형능력·미술활동보고서 진실성) — 실질 당락 좌우"
        },
        weights: { academic: 0.40, career: 0.40, community: 0.20 }
      }
    };

    let profileInfo = "";
    if (data.name || data.grade) {
      profileInfo = (data.grade ? data.grade + "학년 " : "") + (data.class ? data.class + "반 " : "") + (data.number ? data.number + "번 " : "") + (data.name || "학생");
    }

    const uniCriteria = universityEvalCriteria[data.university];
    const weights = uniCriteria?.weights || { academic: 0.33, career: 0.33, community: 0.34 };

    const evalCriteriaSection = uniCriteria ? uniCriteria.factors : "";
    const competencyNames = uniCriteria
      ? uniCriteria.competencies
      : { academic: "학업역량 (Academic Competency)", career: "진로역량 (Career Competency)", community: "공동체역량 (Community Competency)" };

    const promptText = "당신은 대한민국 입시 전문가이자 학교생활기록부 평가 전문 AI 입니다.\n" +
      "다음 학생의 학교생활기록부 데이터를 종합 분석하여 지원 대학/학과 합격 가능성 리포트를 JSON으로 작성하세요.\n\n" +
      "[학생 정보]\n목표 대학: " + data.university + "\n지원 학과: " + data.major + "\n학생: " + profileInfo + "\n" +
      "이수 과목: " + data.courses + "\n교과 평균 등급: " + data.averageGrade + "\n성취도 전용(P 미포함) 과목: " + data.achievementOnly + "\n\n" +
      "[세부능력 및 활동기록]\n교과 세특:\n" + data.subjectRecords + "\n\n" +
      "창체기록(자율/동아리/봉사/진로):\n" + data.creativeActivities + "\n\n" +
      "행동특성 및 종합의견:\n" + data.behavioralRecords + "\n\n" +
      evalCriteriaSection +
      "[분석 지침]\n" +
      "1. " + competencyNames.academic + " (반영 비율: " + (weights.academic * 100).toFixed(0) + "%)\n" +
      "2. " + competencyNames.career + " (반영 비율: " + (weights.career * 100).toFixed(0) + "%)\n" +
      "3. " + competencyNames.community + " (반영 비율: " + (weights.community * 100).toFixed(0) + "%)\n\n" +
      "[평가 원칙] 당신은 매우 냉철하고 엄격한 입학사정관입니다. 단순한 나열이나 칭찬 위주의 서술을 지양하고, 학생의 기록에서 실질적인 역량이 드러나지 않는 부분이나 보완이 필요한 지점을 날카롭게 비판하십시오. 변별력을 위해 점수를 짜게 부여하십시오.\n\n" +
      "[종합 평가 주안점] " + data.university + " " + data.major + " 입학사정관의 시각에서 강점뿐만 아니라 치명적인 약점과 향후 전략적 보완점을 400자 이상 상세히 서술하세요.\n\n" +
      "[근거 자료] 각 역량별로 생기부 기록에 기반한 구체적인 근거를 5~7개씩 반드시 JSON 배열(List) 형태로 작성하세요.\n\n" +
      "[점수 산출 근거] 각 역량(학업/진로/공동체) 별로 부여한 점수가 어떤 기준(교과 성취도, 탐구 역량, 활동의 질 등)으로 합산되었는지 구체적인 수치나 비중을 포함하여 산출 근거를 기술하세요.\n\n" +
      "반드시 유효한 JSON 형식으로만 응답하세요. 다른 설명이나 마크다운 백틱(```)은 포함하지 마십시오. \n" +
      "특히, 생성되는 문자열 내에 실제 줄바꿈(Line break)이 포함되지 않도록 주의하고, 줄바꿈이 필요한 경우 반드시 '\\n' 문자로 대체하십시오.";
    const requestBody = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            totalScore: { type: "NUMBER" },
            overallEvaluation: { type: "STRING" },
            competencies: {
              type: "OBJECT",
              properties: {
                academic: {
                  type: "OBJECT",
                  properties: {
                    score: { type: "NUMBER" },
                    evaluation: { type: "STRING" },
                    scoreJustification: { type: "STRING" },
                    evidence: { type: "ARRAY", items: { type: "STRING" } }
                  },
                  required: ["score", "evaluation", "scoreJustification", "evidence"]
                },
                career: {
                  type: "OBJECT",
                  properties: {
                    score: { type: "NUMBER" },
                    evaluation: { type: "STRING" },
                    scoreJustification: { type: "STRING" },
                    evidence: { type: "ARRAY", items: { type: "STRING" } }
                  },
                  required: ["score", "evaluation", "scoreJustification", "evidence"]
                },
                community: {
                  type: "OBJECT",
                  properties: {
                    score: { type: "NUMBER" },
                    evaluation: { type: "STRING" },
                    scoreJustification: { type: "STRING" },
                    evidence: { type: "ARRAY", items: { type: "STRING" } }
                  },
                  required: ["score", "evaluation", "scoreJustification", "evidence"]
                }
              },
              required: ["academic", "career", "community"]
            }
          },
          required: ["totalScore", "overallEvaluation", "competencies"]
        }
      }
    };
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
    if (!response.ok) { const ed = await response.json().catch(() => ({})); throw new Error(ed.error?.message || "API 요청이 실패했습니다."); }
    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) throw new Error("AI 응답에서 텍스트를 추출할 수 없습니다.");

    try {
      let jsonString = generatedText.trim();

      // 마크다운 블록 제거 (혹시 몰라서 중복 처리)
      if (jsonString.startsWith("```")) {
        const match = jsonString.match(/^```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) jsonString = match[1].trim();
      }

      const startIdx = jsonString.indexOf('{');
      const endIdx = jsonString.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
        jsonString = jsonString.substring(startIdx, endIdx + 1);
      }

      // JSON 구조 보정
      jsonString = jsonString.replace(/"([^"]*?)"/gs, (match, p1) => {
        return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
      });

      const report = JSON.parse(jsonString);
      const sAca = report.competencies?.academic?.score || 0;
      const sCar = report.competencies?.career?.score || 0;
      const sCom = report.competencies?.community?.score || 0;

      const calcTotal = Math.round(
        (sAca * weights.academic) +
        (sCar * weights.career) +
        (sCom * weights.community)
      );

      report.totalScore = calcTotal;
      report.calculationFormula = `종합점수(${calcTotal}) = (학업 ${sAca}점 × ${weights.academic}) + (진로 ${sCar}점 × ${weights.career}) + (공동체 ${sCom}점 × ${weights.community})`;

      return JSON.stringify(report);
    } catch (e) {
      console.warn("Internal JSON fix failed, returning raw text. Error:", e.message);
      return generatedText;
    }
  }

  // --- Persistence Logic ---
  const STORAGE_KEYS = {
    API_KEY: "ai_student_api_key",
    STUDENT_LIST: "ai_student_list",
    COURSE_DATA: "ai_student_course_data",
    BATCH_DATA: "ai_student_batch_data",
    SELECTED_INDEX: "ai_student_selected_index",
    UNI: "ai_student_uni",
    CAT: "ai_student_cat",
    MAJOR: "ai_student_major"
  };

  function saveState() {
    console.log("Saving state to localStorage...");
    if (!apiKeyInput) return;
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKeyInput.value);
    localStorage.setItem(STORAGE_KEYS.UNI, universitySelect.value);
    localStorage.setItem(STORAGE_KEYS.CAT, categorySelect.value);
    localStorage.setItem(STORAGE_KEYS.MAJOR, majorSelect.value);
    localStorage.setItem(STORAGE_KEYS.SELECTED_INDEX, studentSelect.selectedIndex);

    try {
      if (studentSelect.innerHTML) localStorage.setItem(STORAGE_KEYS.STUDENT_LIST, studentSelect.innerHTML);
      if (globalCourseJson) localStorage.setItem(STORAGE_KEYS.COURSE_DATA, JSON.stringify(globalCourseJson));
      if (globalBatchJsons) localStorage.setItem(STORAGE_KEYS.BATCH_DATA, JSON.stringify(globalBatchJsons));
    } catch (e) {
      console.warn("Local storage limit might have been exceeded. Some data not saved.", e);
    }
  }

  function loadState() {
    const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (savedApiKey && apiKeyInput) apiKeyInput.value = savedApiKey;

    const savedUni = localStorage.getItem(STORAGE_KEYS.UNI);
    if (savedUni) {
      universitySelect.value = savedUni;
      universitySelect.dispatchEvent(new Event("change"));

      const savedCat = localStorage.getItem(STORAGE_KEYS.CAT);
      if (savedCat) {
        categorySelect.value = savedCat;
        categorySelect.dispatchEvent(new Event("change"));

        const savedMajor = localStorage.getItem(STORAGE_KEYS.MAJOR);
        if (savedMajor) majorSelect.value = savedMajor;
      }
    }

    const savedStudentList = localStorage.getItem(STORAGE_KEYS.STUDENT_LIST);
    if (savedStudentList) {
      studentSelect.innerHTML = savedStudentList;
      const savedIndex = localStorage.getItem(STORAGE_KEYS.SELECTED_INDEX);
      if (savedIndex !== null) {
        studentSelect.selectedIndex = savedIndex;
      }
    }

    const savedCourseData = localStorage.getItem(STORAGE_KEYS.COURSE_DATA);
    if (savedCourseData) {
      try {
        globalCourseJson = JSON.parse(savedCourseData);
      } catch (e) { console.error(e); }
    }

    const savedBatchData = localStorage.getItem(STORAGE_KEYS.BATCH_DATA);
    if (savedBatchData) {
      try {
        globalBatchJsons = JSON.parse(savedBatchData);
      } catch (e) { console.error(e); }
    }

    if (studentSelect.selectedIndex > 0) {
      console.log("Triggering auto-extraction for selected student index:", studentSelect.selectedIndex);
      studentSelect.dispatchEvent(new Event("change"));
    }
  }

  if (resetDataBtn) {
    resetDataBtn.addEventListener("click", () => {
      if (confirm("저장된 모든 학생 데이터와 설정(API 키 포함)을 삭제하시겠습니까?")) {
        localStorage.clear();
        location.reload();
      }
    });
  }

  loadState();

  if (apiKeyInput) apiKeyInput.addEventListener("change", saveState);
  universitySelect.addEventListener("change", saveState);
  categorySelect.addEventListener("change", saveState);
  majorSelect.addEventListener("change", saveState);

  // --- PDF 인쇄 기능 ---
  window.downloadPDF = function() {
    if (!lastReportData) {
      alert("분석 결과가 아직 생성되지 않았습니다. 분석 버튼을 먼저 클릭해 주세요.");
      return;
    }
    updatePrintArea(lastReportData);
    window.print();
  };

  function updatePrintArea(reportData) {
    const printArea = document.getElementById("printDetailedAnalysis");
    if (!printArea) return;

    let printHtml = `<h2 class='print-header' style='color:#000; text-align:center; margin-bottom:2rem; font-size:2rem;'>학생부 종합 평가 상세 리포트</h2>
                     <p style='text-align:right; color:#666; margin-bottom:1rem;'>분석 일시: ${new Date().toLocaleString('ko-KR')}</p>
                     <p style='margin-bottom:2rem; border-bottom:1px solid #eee; padding-bottom:1rem;'><strong>학생 정보:</strong> ${document.getElementById("student-grade")?.value || "-"}학년 ${document.getElementById("student-name")?.value || "선택된 학생 없음"} | <strong>목표:</strong> ${document.getElementById("university")?.value} ${document.getElementById("major")?.value}</p>`;

    const comps = [
      { id: "academic", title: "학업역량" },
      { id: "career", title: "진로역량" },
      { id: "community", title: "공동체역량" }
    ];

    comps.forEach(c => {
      const d = reportData.competencies[c.id] || {};
      const evidenceText = Array.isArray(d.evidence) ? d.evidence.map(e => "- " + e).join("\n") : (d.evidence || "근거 자료가 없습니다.");
      printHtml += `
        <div class="print-comp-item" style="margin-bottom:3rem; page-break-inside:avoid; border-bottom:1px solid #eee; padding-bottom:2rem;">
          <h3 style="font-size:1.6rem; color:#000; border-left:6px solid #5e6ad2; padding-left:1.2rem; margin-bottom:1.5rem; background:#f8faff;">${c.title} (평가 점수: ${d.score || "-"}점)</h3>
          
          <div style="margin-bottom:1.5rem;">
            <div style="font-weight:700; font-size:1.1rem; color:#333; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;"><span>🔍</span> 평가 요약</div>
            <div style="color:#000; line-height:1.7; font-size:0.95rem;">${marked.parse(d.evaluation || "평가 내용이 없습니다.")}</div>
          </div>
          
          ${d.scoreJustification ? `
          <div style="margin-bottom:1.5rem;">
            <div style="font-weight:700; font-size:1.1rem; color:#333; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;"><span>📊</span> 점수 산출 근거</div>
            <div style="color:#000; line-height:1.7; font-size:0.95rem;">${marked.parse(d.scoreJustification)}</div>
          </div>
          ` : ""}
          
          <div>
            <div style="font-weight:700; font-size:1.1rem; color:#333; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;"><span>📝</span> 근거 활동 자료</div>
            <div style="color:#000; line-height:1.7; font-size:0.95rem;">${marked.parse(evidenceText)}</div>
          </div>
        </div>
      `;
    });
    printArea.innerHTML = printHtml;
  }
});