// // types.ts yoki shu fayl ichida yozishingiz mumkin
// export interface Answer {
//   text: string;
//   correct: boolean;
// }

// export interface Question {
//   number?: number;
//   question: string;
//   answers: Record<string, string>;
//   correctAnswer: string;
//   _tempAnswers?: Answer[];
// }

// export interface ParsedResult {
//   title: string | null;
//   questions: Question[];
// }

// // parseQuestions.ts
// export function parseQuestions(text: string): ParsedResult {
//   const lines: string[] = text
//     .split("\n")
//     .map((line) => line.trim())
//     .filter(Boolean);

//   let title: string | null = null;
//   const questions: Question[] = [];
//   let currentQuestion: Question | null = null;
//   let answerCount = 0;
//   let isFirstLine = true;
//   let isCollectingAnswers = false;

//   for (const line of lines) {
//     if (isFirstLine) {
//       title = line;
//       isFirstLine = false;
//       continue;
//     }

//     // New question detection
//     if (
//       !isCollectingAnswers &&
//       line.length > 0 &&
//       !line.startsWith("+") &&
//       !line.startsWith("-")
//     ) {
//       if (currentQuestion) {
//         questions.push(currentQuestion);
//       }
//       currentQuestion = {
//         question: line,
//         answers: {},
//         correctAnswer: "",
//         _tempAnswers: [],
//       };
//       answerCount = 0;
//       isCollectingAnswers = true;
//     } else if (isCollectingAnswers && currentQuestion) {
//       if (line.startsWith("+")) {
//         // Correct answer
//         currentQuestion._tempAnswers?.push({
//           text: line.slice(1).trim(),
//           correct: true,
//         });
//         answerCount++;
//       } else if (line.startsWith("-") || line.length > 0) {
//         // Incorrect answer, remove "-" if present
//         currentQuestion._tempAnswers?.push({
//           text: line.replace(/^-/, "").trim(),
//           correct: false,
//         });
//         answerCount++;
//       }

//       if (answerCount === 4) {
//         isCollectingAnswers = false;
//       }
//     }
//   }

//   if (currentQuestion) {
//     questions.push(currentQuestion);
//   }

//   // Assign a, b, c, d to answers
//   const letters = ["a", "b", "c", "d"];
//   questions.forEach((q, index) => {
//     q.number = index + 1;
//     q._tempAnswers?.forEach((ans, idx) => {
//       const key = letters[idx];
//       q.answers[key] = ans.text;
//       if (ans.correct) {
//         q.correctAnswer = key;
//       }
//     });
//     delete q._tempAnswers;
//   });

//   return { title, questions };
// }




// // utils/readDocx.ts
// import PizZip from "pizzip";
// import Docxtemplater from "docxtemplater";

// export async function readDocx(file: File): Promise<string> {
//   const arrayBuffer = await file.arrayBuffer();
//   const zip = new PizZip(arrayBuffer);
//   const doc = new Docxtemplater(zip);
//   return doc.getFullText().replace(/\. /g, ".\n");; // butun matn string sifatida
// }

export interface Option {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  number: number;
  text: string;
  options: Option[];
}

export interface ParsedResult {
  title: string;
  questions: Question[];
}

// export async function parseQuestions(text: string): Promise<ParsedResult> {
  
//   const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

//   // 1️⃣ Faylning boshidagi title
//   const title = lines.shift() || "Untitled Quiz";

//   const questions: Question[] = [];
//   let currentQuestion: Question | null = null;

//   for (const line of lines) {
//     // Savolni aniqlash (raqam + nuqta bilan boshlansa)
//     const questionMatch = line.match(/^(\d+)\.\s*(.*)/);
//     if (questionMatch) {
//       if (currentQuestion) {
//         questions.push(currentQuestion);
//       }

//       currentQuestion = {
//         number: parseInt(questionMatch[1], 10),
//         text: questionMatch[2].trim(),
//         options: [],
//       };
//       continue;
//     }

//     // Variantlarni aniqlash
//     if (currentQuestion) {
//       if (line.startsWith("+")) {
//         currentQuestion.options.push({
//           text: line.substring(1).trim(),
//           isCorrect: true,
//         });
//       } else if (line.startsWith("-")) {
//         currentQuestion.options.push({
//           text: line.substring(1).trim(),
//           isCorrect: false,
//         });
//       }
//     }
//   }

//   if (currentQuestion) {
//     questions.push(currentQuestion);
//   }

//   return { title, questions };
// }



export async function parseQuestions(text: string): Promise<ParsedResult> {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

  // 1️⃣ Faylning boshidagi title
  let title = "";
  let startIndex = 0;
  
  // VARIANT 1: Birinchi qator har qanday raqam bilan boshlanadimi? (\d+\.)
  if (/^\d+\.\s+/.test(lines[0])) {
    // Ha - title yo'q, darhol savollar boshlanadi
    title = "";
    startIndex = 0;
  } 
  // VARIANT 2: Birinchi qator "+" yoki "-" bilan boshlanadimi?
  else if (lines[0].startsWith("+") || lines[0].startsWith("-")) {
    // Ha - bu savol yoki javob, title yo'q
    title = "";
    startIndex = 0;
  }
  // VARIANT 3: Boshqa holatda - birinchi belgili qatorni topguncha title
  else {
    for (let i = 0; i < lines.length; i++) {
      // Har qanday raqamli savol (\d+\.) yoki "+" yoki "-" topilsa, bu yerdan savollar boshlanadi
      if (/^\d+\.\s+/.test(lines[i]) || lines[i].startsWith("+") || lines[i].startsWith("-")) {
        startIndex = i;
        break;
      } else {
        // Hali topilmadi - bu qatorni title ga qo'shamiz
        if (title) title += " ";
        title += lines[i];
      }
    }
  }
  
  // Faqat savollar qismini qoldirish
  const questionLines = lines.slice(startIndex);

  const questions: Question[] = [];
  let currentQuestion: Question | null = null;
  let questionNumber = 0;

  console.log('=== PARSING INFO ===');
  console.log('Title:', title || '(title yo\'q)');
  console.log('Total lines:', questionLines.length);
  console.log('First 5 lines:', questionLines.slice(0, 5));
  console.log('Last 5 lines:', questionLines.slice(-5));

  for (let i = 0; i < questionLines.length; i++) {
    const line = questionLines[i];
    
    // BIRINCHI: Raqamli savollarni aniqlash (1., 2., 3. ...)
    // Bu eng yuqori prioritet
    const questionMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (questionMatch) {
      if (currentQuestion) {
        console.log(`[${i}] Pushing question #${currentQuestion.number} with ${currentQuestion.options.length} options`);
        questions.push(currentQuestion);
      }

      questionNumber++;
      currentQuestion = {
        number: questionNumber,
        text: questionMatch[2].trim(),
        options: [],
      };
      console.log(`[${i}] New numbered question: #${questionNumber}`);
      continue;
    }
    
    // IKKINCHI: Variantlarni tekshirish (+ yoki - bilan boshlanganlar)
    if (line.startsWith("+") || line.startsWith("-")) {
      // Agar faqat + yoki - belgisi bo'lsa (matn yo'q), ignore qilamiz
      const textAfterMarker = line.substring(1).trim();
      if (textAfterMarker.length === 0) {
        console.log(`[${i}] Ignoring empty marker line: "${line}"`);
        continue;
      }
      
      // Agar oldingi savol 4 ta variant bilan to'lgan bo'lsa, bu yangi savol
      if (currentQuestion && currentQuestion.options.length >= 4) {
        console.log(`[${i}] Pushing question #${currentQuestion.number} with ${currentQuestion.options.length} options (4 options complete)`);
        questions.push(currentQuestion);
        
        questionNumber++;
        currentQuestion = {
          number: questionNumber,
          text: textAfterMarker,
          options: [],
        };
        console.log(`[${i}] New question after 4 options: #${questionNumber} - ${textAfterMarker.substring(0, 50)}`);
        continue;
      }
      
      // Agar hali birinchi savol boshlanmagan bo'lsa va + kelsa, bu birinchi savol
      if (!currentQuestion && line.startsWith("+")) {
        questionNumber++;
        currentQuestion = {
          number: questionNumber,
          text: textAfterMarker,
          options: [],
        };
        console.log(`[${i}] First question (no number): #${questionNumber} - ${textAfterMarker.substring(0, 50)}`);
        continue;
      }
      
      // Qisqa matn yoki savol emas - bu javob varianti
      if (currentQuestion) {
        const isCorrect = line.startsWith("+");
        currentQuestion.options.push({
          text: textAfterMarker,
          isCorrect: isCorrect,
        });
        console.log(`[${i}]   ${isCorrect ? '+' : '-'} Option #${currentQuestion.options.length}: ${textAfterMarker.substring(0, 30)}`);
      }
      continue;
    }

    // Raqamsiz savollar (agar oldingi savol to'ldirilgan bo'lsa - 4 ta variant)
    if (currentQuestion && currentQuestion.options.length >= 4 && line.length > 15) {
      console.log(`[${i}] Pushing question #${currentQuestion.number} with ${currentQuestion.options.length} options (new question detected)`);
      questions.push(currentQuestion);
      
      questionNumber++;
      currentQuestion = {
        number: questionNumber,
        text: line.trim(),
        options: [],
      };
      console.log(`[${i}] New unnumbered question: #${questionNumber} - ${line.substring(0, 50)}`);
    } else if (!currentQuestion && line.length > 15) {
      // Birinchi savol
      questionNumber++;
      currentQuestion = {
        number: questionNumber,
        text: line.trim(),
        options: [],
      };
      console.log(`[${i}] First question: #${questionNumber} - ${line.substring(0, 50)}`);
    } 
    // YANGI: Agar savol bor va variantlar soni 4 tadan kam bo'lsa, 
    // oddiy matnni ham variant sifatida qabul qilamiz (minus belgisiz javoblar uchun)
    else if (currentQuestion && currentQuestion.options.length > 0 && currentQuestion.options.length < 4 && line.length > 5 && line.length < 100) {
      // Bu javob varianti bo'lishi mumkin (minus belgisiz)
      currentQuestion.options.push({
        text: line.trim(),
        isCorrect: false, // minus belgisiz -> noto'g'ri javob
      });
      console.log(`[${i}]   - Option #${currentQuestion.options.length} (no marker): ${line.substring(0, 30).trim()}`);
    }
    // Davom etayotgan matn (savol yoki javobning davomi) - FAQAT belgisiz qatorlar uchun
    else if (currentQuestion && !line.startsWith("+") && !line.startsWith("-")) {
      // Agar oxirgi variant bor bo'lsa va 4 tadan kam bo'lsa, uni davom ettirish
      if (currentQuestion.options.length > 0 && currentQuestion.options.length < 4) {
        const lastOption = currentQuestion.options[currentQuestion.options.length - 1];
        lastOption.text += " " + line.trim();
        console.log(`[${i}]   Continuing last option: ${line.substring(0, 30).trim()}`);
      } 
      // Aks holda savol matnini davom ettirish (faqat agar variant yo'q bo'lsa)
      else if (currentQuestion.options.length === 0 && line.length > 0) {
        currentQuestion.text += " " + line.trim();
        console.log(`[${i}]   Continuing question: ${line.substring(0, 30).trim()}`);
      }
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  // DEBUG: Har bir savolning variantlarini tekshirish
  console.log('=== FINAL QUESTIONS CHECK ===');
  questions.forEach((q, idx) => {
    const correctCount = q.options.filter(opt => opt.isCorrect).length;
    console.log(`Q${idx + 1}: ${q.options.length} options, ${correctCount} correct`);
    if (correctCount !== 1) {
      console.warn(`⚠️ Question ${idx + 1} has ${correctCount} correct answers!`);
    }
    if (q.options.length < 2) {
      console.warn(`⚠️ Question ${idx + 1} has only ${q.options.length} options!`);
    }
  });

  return { title, questions };
}

// === Test ===
// (async () => {
//   const result = await parseQuestions("questions.docx");
//   console.log(JSON.stringify(result, null, 2));
// })();

import { renderAsync } from "docx-preview";



export async function readDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();


  // Document uchun vaqtinchalik container yaratamiz
  const container = document.createElement("div");

  // docx-preview orqali render qilamiz
  await renderAsync(arrayBuffer, container, undefined, {
   inWrapper: false,
    ignoreWidth: true,
    ignoreHeight: true,
    breakPages: false,
    ignoreLastRenderedPageBreak: true,
    experimental: false,
  });
  container.querySelectorAll("style").forEach(el => el.remove());
  
  // DEBUG: HTML strukturani ko'rish
  console.log('=== CONTAINER HTML (first 2000 chars) ===');
  console.log(container.innerHTML.substring(0, 2000));
  
  // DEBUG: List klasslarini topish
  const allListElements = container.querySelectorAll('[class*="docx-num"]');
  console.log('=== FOUND LIST ELEMENTS ===');
  allListElements.forEach((el, idx) => {
    console.log(`[${idx}] Class: ${el.className}, Text: ${el.textContent?.substring(0, 50)}`);
  });
  
  // DEBUG: Minus belgili elementlarni topish
  const allParagraphs = container.querySelectorAll('p');
  console.log('=== ALL PARAGRAPHS (first 20) ===');
  Array.from(allParagraphs).slice(0, 20).forEach((el, idx) => {
    const text = el.textContent?.trim() || '';
    if (text.length < 100) {
      console.log(`[${idx}] Class: "${el.className}", Text: "${text.substring(0, 60)}"`);
    }
  });
  
  const extractedText = extractTextWithNewlines(container);
  
  console.log('=== EXTRACTED TEXT WITH MARKERS (first 1000 chars) ===');
  console.log(extractedText.substring(0, 1000));
  
  return extractedText;

//   // Mammoth bilan matnni o‘qiymiz
//   const { value } = await mammoth.extractRawText({ arrayBuffer });

//   // Har paragraf oxiriga new line qo‘shamiz
//   return value
//     .split("\n")
//     .map(line => line.trim())
//     .filter(Boolean)
//     .join("\n");
}










const BLOCKS = new Set(["P","DIV","LI","H1","H2","H3","H4","H5","H6","TR"]);

function extractTextWithNewlines(root: HTMLElement): string {
  const out: string[] = [];
  
  // Numbering list counter
  const numberingCounters: { [key: string]: number } = {};

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out.push((node as Text).data);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;
    const tag = el.tagName;

    if (tag === "BR") { out.push("\n"); return; }

    // List marker'larni qo'shish
    if (tag === "P") {
      const classList = el.className;
      const textContent = el.textContent?.trim() || "";
      
      // docx-num-1-X -> numbering list (savollar yoki to'g'ri javoblar)
      const numberingMatch = classList.match(/docx-num-(\d+)-(\d+)/);
      if (numberingMatch) {
        const listType = numberingMatch[1]; // 1, 2, 3, 4, ...
        const level = numberingMatch[2]; // 0, 1, 2, ...
        
        if (listType === "1") {
          // docx-num-1-X -> to'g'ri javob yoki savol
          if (textContent.length < 50) {
            // Qisqa matn -> javob varianti (to'g'ri javob)
            out.push("+");
          } else {
            // Uzun matn -> savol
            // Counter'ni oshiramiz va raqam qo'shamiz
            if (!numberingCounters[level]) {
              numberingCounters[level] = 0;
            }
            numberingCounters[level]++;
            out.push(`${numberingCounters[level]}. `);
          }
        } else {
          // Boshqa barcha list turlar (2, 3, 4, ...) -> noto'g'ri javob
          out.push("-");
        }
      }
    }

    // children
    for (const child of Array.from(el.childNodes)) walk(child);

    // table cells -> tab; row -> newline
    if (tag === "TD" || tag === "TH") out.push("\t");
    if (BLOCKS.has(tag)) out.push("\n");
  };

  walk(root);

  // normalize
  return out.join("")
    .replace(/\u00A0/g, " ")    // non-breaking space
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}









// 
export type AnswerLetter = "A" | "B" | "C" | "D" | "E";

export interface CreateTestItemDto {
  question: string;
  number: number;
  testId: number;
  answer: AnswerLetter;
  answer_A: string;
  answer_B: string;
  answer_C: string;
  answer_D?: string;
  answer_E?: string;
}


const letters = ["A", "B", "C", "D", "E"];

export function mapQuestionToDto(question: Question, testId: number): CreateTestItemDto {
  const answers = question.options.reduce((acc, opt, idx) => {
    acc[letters[idx]] = opt.text;
    return acc;
  }, {} as Record<string, string>);

  const correctIndex = question.options.findIndex(opt => opt.isCorrect);
  const correctLetter = (correctIndex >= 0 ? letters[correctIndex] : "A") as AnswerLetter;

  return {
    question: question.text,
    number: question.number,
    testId,
    answer: correctLetter,
    answer_A: answers.A || "",
    answer_B: answers.B || "",
    answer_C: answers.C || "",
    answer_D: answers.D || "",
    answer_E: answers.E || "",
  };
}

// DOCX ga eksport qilish funksiyasi
import { Document, Packer, Paragraph, TextRun, AlignmentType, NumberFormat } from 'docx';
import { saveAs } from 'file-saver';

export async function downloadAsDocx(questions: Question[], title?: string, filename: string = 'test.docx') {
  const paragraphs: Paragraph[] = [];
  
  // Title qo'shish (agar bo'lsa) - centered va bold
  if (title) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 28, // 14pt font
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400, // Bo'sh joy keyingi qatorga
        },
      })
    );
  }
  
  // Teskari tartibda savollarni olish
  const reversedQuestions = [...questions].reverse();
  
  // Har bir savolni formatlash
  reversedQuestions.forEach((q, qIndex) => {
    // Savol matnidan boshidagi raqam va nuqtani olib tashlash
    const cleanText = q.text.replace(/^\d+\.\s*/, '');
    
    // Savol matni - faqat matn, raqamsiz
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: cleanText,
            size: 24, // 12pt font
          }),
        ],
        numbering: {
          reference: 'question-numbering',
          level: 0,
        },
        spacing: {
          after: 120,
        },
      })
    );
    
    // Javob variantlari
    q.options.forEach((opt) => {
      const marker = opt.isCorrect ? '+' : '-';
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${marker} ${opt.text}`,
              size: 24, // 12pt font
            }),
          ],
          indent: {
            left: 720, // Indent javoblar uchun
          },
          spacing: {
            after: 100,
          },
        })
      );
    });
    
    // Savollar orasida bo'sh qator
    if (qIndex < reversedQuestions.length - 1) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: '' })],
          spacing: {
            after: 200,
          },
        })
      );
    }
  });
  
  // Document yaratish
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'question-numbering',
          levels: [
            {
              level: 0,
              format: NumberFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });
  
  // DOCX faylni yaratib yuklab olish
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

