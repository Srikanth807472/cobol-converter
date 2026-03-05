// COBOL to Modern Language Converter — Unified AST Approach (v2 – Large Program Support)
class COBOLConverter {
    constructor() {
        this.currentLanguage = 'python';
        this.examples = {
            hello: `IDENTIFICATION DIVISION.
PROGRAM-ID. HELLO-WORLD.
PROCEDURE DIVISION.
DISPLAY "Hello, World!"
STOP RUN.`,
            
            data: `IDENTIFICATION DIVISION.
PROGRAM-ID. DATA-EXAMPLE.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-NAME PIC X(20) VALUE "John Doe".
01 WS-AGE PIC 9(2) VALUE 25.
PROCEDURE DIVISION.
DISPLAY "Name: " WS-NAME
DISPLAY "Age: " WS-AGE
STOP RUN.`,
            
            loop: `IDENTIFICATION DIVISION.
PROGRAM-ID. LOOP-EXAMPLE.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-COUNTER PIC 9(3) VALUE 1.
PROCEDURE DIVISION.
PERFORM VARYING WS-COUNTER FROM 1 BY 1 UNTIL WS-COUNTER > 5
    DISPLAY "Count: " WS-COUNTER
END-PERFORM
STOP RUN.`,
            
            calc: `IDENTIFICATION DIVISION.
PROGRAM-ID. CALC-EXAMPLE.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-NUM1 PIC 9(4) VALUE 100.
01 WS-NUM2 PIC 9(4) VALUE 25.
01 WS-RESULT PIC 9(6).
01 WS-FLAG PIC X VALUE "Y".
05 WS-COUNTER PIC 9(3) VALUE 1.
77 WS-TOTAL PIC 9(8) VALUE 0.
PROCEDURE DIVISION.
MOVE 50 TO WS-NUM1
COMPUTE WS-RESULT = WS-NUM1 + WS-NUM2
DISPLAY "Addition: " WS-RESULT
COMPUTE WS-RESULT = WS-NUM1 * WS-NUM2
DISPLAY "Multiplication: " WS-RESULT
ADD 50 TO WS-NUM1
SUBTRACT 10 FROM WS-NUM2
DIVIDE WS-NUM1 BY WS-NUM2 GIVING WS-RESULT
DISPLAY "Final result: " WS-RESULT
PERFORM VARYING WS-COUNTER FROM 1 BY 1 UNTIL WS-COUNTER > 5
    ADD WS-COUNTER TO WS-TOTAL
    DISPLAY "Counter: " WS-COUNTER " Total: " WS-TOTAL
END-PERFORM
IF WS-TOTAL > 10 THEN
    DISPLAY "Total is greater than 10"
ELSE
    DISPLAY "Total is 10 or less"
END-IF
STOP RUN.`,
            
            iterif: `IDENTIFICATION DIVISION.
PROGRAM-ID. IterIf.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 Num1 PIC 9 VALUE ZEROS.
01 Num2 PIC 9 VALUE ZEROS.
01 Result PIC 99 VALUE ZEROS.
01 Operator PIC X VALUE SPACE.
PROCEDURE DIVISION.
PERFORM 3 TIMES
    DISPLAY "Enter First Number :" WITH NO ADVANCING
    ACCEPT Num1
    DISPLAY "Enter Second Number :" WITH NO ADVANCING
    ACCEPT Num2
    DISPLAY "Enter operator (+ or *) : " WITH NO ADVANCING
    ACCEPT Operator
    IF Operator = "+" THEN
        ADD Num1, Num2 GIVING Result
    END-IF
    IF Operator = "*" THEN
        MULTIPLY Num1 BY Num2 GIVING Result
    END-IF
    DISPLAY "Result is = ", Result
END-PERFORM
STOP RUN.`,

            evaluate: `IDENTIFICATION DIVISION.
PROGRAM-ID. EVALUATE-EXAMPLE.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-GRADE PIC X VALUE "B".
01 WS-SCORE PIC 9(3) VALUE 85.
01 WS-MSG PIC X(30) VALUE SPACES.
PROCEDURE DIVISION.
EVALUATE WS-GRADE
    WHEN "A"
        MOVE "Excellent" TO WS-MSG
    WHEN "B"
        MOVE "Good" TO WS-MSG
    WHEN "C"
        MOVE "Average" TO WS-MSG
    WHEN OTHER
        MOVE "Needs Improvement" TO WS-MSG
END-EVALUATE
DISPLAY "Grade: " WS-GRADE " - " WS-MSG
EVALUATE TRUE
    WHEN WS-SCORE >= 90
        DISPLAY "Honor Roll"
    WHEN WS-SCORE >= 70
        DISPLAY "Passing"
    WHEN OTHER
        DISPLAY "Failing"
END-EVALUATE
STOP RUN.`,

            paragraph: `IDENTIFICATION DIVISION.
PROGRAM-ID. PARAGRAPH-EXAMPLE.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-NUM PIC 9(4) VALUE 10.
01 WS-RESULT PIC 9(8) VALUE 0.
01 WS-I PIC 9(4) VALUE 1.
PROCEDURE DIVISION.
DISPLAY "Starting calculations..."
PERFORM CALCULATE-SQUARE
DISPLAY "Square of " WS-NUM " is " WS-RESULT
PERFORM VARYING WS-I FROM 1 BY 1 UNTIL WS-I > 3
    ADD 5 TO WS-NUM
    PERFORM CALCULATE-SQUARE
    DISPLAY "Square of " WS-NUM " is " WS-RESULT
END-PERFORM
PERFORM SHOW-FOOTER
STOP RUN.
CALCULATE-SQUARE.
    MULTIPLY WS-NUM BY WS-NUM GIVING WS-RESULT.
SHOW-FOOTER.
    DISPLAY "=== Calculation Complete ===".`,

            string: `IDENTIFICATION DIVISION.
PROGRAM-ID. STRING-EXAMPLE.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 WS-FIRST PIC X(10) VALUE "John".
01 WS-LAST PIC X(10) VALUE "Doe".
01 WS-FULL PIC X(25) VALUE SPACES.
01 WS-DELIM PIC X VALUE ",".
01 WS-PART1 PIC X(10) VALUE SPACES.
01 WS-PART2 PIC X(10) VALUE SPACES.
01 WS-DATA PIC X(20) VALUE "Hello,World".
PROCEDURE DIVISION.
STRING WS-FIRST DELIMITED BY SPACE
       " "      DELIMITED BY SIZE
       WS-LAST  DELIMITED BY SPACE
       INTO WS-FULL
END-STRING
DISPLAY "Full Name: " WS-FULL
UNSTRING WS-DATA DELIMITED BY ","
    INTO WS-PART1 WS-PART2
END-UNSTRING
DISPLAY "Part 1: " WS-PART1
DISPLAY "Part 2: " WS-PART2
STOP RUN.`
        };
        
        this.init();
    }

    init() {
        console.log('Initializing COBOL Converter...');
        this.bindEvents();
        this.showNotification('COBOL Converter ready!', 'info');
    }

    bindEvents() {
        const on = (id, evt, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(evt, fn); };
        on('convertBtn', 'click', () => this.convert());
        on('clearBtn', 'click', () => this.clear());
        on('copyBtn', 'click', () => this.copy());
        on('downloadBtn', 'click', () => this.download());
        on('targetLang', 'change', (e) => {
            this.currentLanguage = e.target.value;
            const txt = e.target.options[e.target.selectedIndex].text;
            const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
            set('outputLang', txt); set('modernLangName', txt); set('runModernLang', txt); set('modernLangPlaceholder', txt);
        });
        on('loadExampleBtn', 'click', () => this.loadRandomExample());
        document.querySelectorAll('.example-card').forEach(card => {
            card.addEventListener('click', (e) => this.loadExample(e.currentTarget.dataset.example));
        });
        const nc = document.querySelector('.notification-close');
        if (nc) nc.addEventListener('click', () => this.hideNotification());
        on('runCobolBtn', 'click', () => this.runCOBOL());
        on('runModernBtn', 'click', () => this.runModern());
        on('runBothBtn', 'click', () => this.runBothAndCompare());
        on('clearOutputBtn', 'click', () => this.clearRunOutput());
    }

    // =====================================================================
    //  UNIFIED COBOL PARSER -> AST
    //  Produces a list of statement objects in execution order.
    //  Every converter + the interpreter use this same AST.
    // =====================================================================

    /** Join continuation lines (lines that don't start with a COBOL verb) */
    _joinContinuationLines(lines) {
        const verbs = /^(DISPLAY|MOVE|COMPUTE|ADD|SUBTRACT|MULTIPLY|DIVIDE|PERFORM|IF|ELSE|END-IF|END-PERFORM|END-EVALUATE|EVALUATE|WHEN|ACCEPT|STRING|UNSTRING|END-STRING|END-UNSTRING|GO|INSPECT|SET|INITIALIZE|STOP|EXIT|CALL|OPEN|CLOSE|READ|WRITE|REWRITE|DELETE|START|SEARCH|SORT|MERGE|COPY|GOBACK)\b/i;
        const result = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (verbs.test(trimmed) || result.length === 0) {
                result.push(trimmed);
            } else {
                // Continuation of previous line
                result[result.length - 1] += ' ' + trimmed;
            }
        }
        return result;
    }

    /** Parse DATA DIVISION variables */
    parseVariables(code) {
        const vars = [];
        const re = /(?:01|05|10|15|77|88)\s+([A-Z0-9\-_]+)\s+PIC\s+([^\s.]+)(?:\s+VALUE\s+["']?([^"'\s.]+)["']?)?/gi;
        let m;
        while ((m = re.exec(code)) !== null) {
            const pic = m[2].toUpperCase();
            const isStr = pic.includes('X') || pic.includes('A');
            let rawVal = m[3] != null ? m[3] : null;
            // Resolve COBOL figurative constants
            if (rawVal != null) {
                const upper = rawVal.toUpperCase();
                if (upper === 'ZEROS' || upper === 'ZERO' || upper === 'ZEROES') rawVal = isStr ? '0' : '0';
                else if (upper === 'SPACES' || upper === 'SPACE') rawVal = '';
            }
            vars.push({
                name: m[1].toUpperCase(),
                pic: pic,
                value: rawVal != null ? (isStr ? String(rawVal) : (isNaN(rawVal) ? 0 : Number(rawVal))) : (isStr ? '' : 0),
                type: isStr ? 'string' : 'number'
            });
        }
        // Also parse 88-level condition names
        const re88 = /88\s+([A-Z0-9\-_]+)\s+VALUE\s+["']?([^"'\s.]+)["']?/gi;
        while ((m = re88.exec(code)) !== null) {
            if (!vars.find(v => v.name === m[1].toUpperCase())) {
                vars.push({ name: m[1].toUpperCase(), pic: '', value: m[2], type: '88-level', parent: null });
            }
        }
        return vars;
    }

    /** Parse PROCEDURE DIVISION into an ordered AST of statements. */
    parseStatements(code) {
        const lines = code.split('\n').map(l => l.trim()).filter(l => l);
        const procLines = [];
        let found = false;
        for (const line of lines) {
            if (line.toUpperCase().includes('PROCEDURE DIVISION')) { found = true; continue; }
            if (found) {
                let cleaned = line.replace(/\.\s*$/, '').trim();
                const u = cleaned.toUpperCase();
                if (u === 'STOP RUN' || u === 'GOBACK') continue;
                if (u.startsWith('END PROGRAM')) continue;
                if (u === 'EXIT' || u === 'EXIT PARAGRAPH' || u === 'EXIT SECTION') continue;
                // Strip WITH NO ADVANCING from DISPLAY
                cleaned = cleaned.replace(/\s+WITH\s+NO\s+ADVANCING\s*$/i, '');
                procLines.push(cleaned);
            }
        }
        // Join continuation lines
        const joined = this._joinContinuationLines(procLines);
        return this._parseProgram(joined);
    }

    /** Top-level parser: separates main code from paragraphs */
    _parseProgram(lines) {
        const paragraphs = {};
        const mainLines = [];
        let currentParagraph = null;
        let currentParaLines = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const upper = line.toUpperCase();
            // Paragraph label: single word (possibly with hyphens) NOT a COBOL verb
            const paraMatch = line.match(/^([A-Z][A-Z0-9\-_]*)\s*$/i);
            const isVerb = /^(DISPLAY|MOVE|COMPUTE|ADD|SUBTRACT|MULTIPLY|DIVIDE|PERFORM|IF|ELSE|END-IF|END-PERFORM|END-EVALUATE|EVALUATE|WHEN|ACCEPT|STRING|UNSTRING|END-STRING|END-UNSTRING|GO|INSPECT|SET|INITIALIZE|CALL)\b/i.test(upper);
            
            if (paraMatch && !isVerb) {
                if (currentParagraph) {
                    paragraphs[currentParagraph] = this._parseBlock(currentParaLines, 0).stmts;
                }
                currentParagraph = paraMatch[1].toUpperCase();
                currentParaLines = [];
            } else if (currentParagraph) {
                currentParaLines.push(line);
            } else {
                mainLines.push(line);
            }
        }
        if (currentParagraph) {
            paragraphs[currentParagraph] = this._parseBlock(currentParaLines, 0).stmts;
        }

        const result = this._parseBlock(mainLines, 0);
        result.stmts._paragraphs = paragraphs;
        return result.stmts;
    }

    /** Recursive block parser. Returns {stmts, nextIndex}. */
    _parseBlock(lines, start) {
        const stmts = [];
        let i = start;
        while (i < lines.length) {
            const line = lines[i];
            const upper = line.toUpperCase();

            // End markers
            if (upper.startsWith('END-PERFORM') || upper.startsWith('END-IF') || upper === 'ELSE' || upper.startsWith('END-EVALUATE') || upper.startsWith('END-STRING') || upper.startsWith('END-UNSTRING')) {
                return { stmts, nextIndex: i };
            }

            // EVALUATE / WHEN (switch/case)
            if (upper.startsWith('EVALUATE')) {
                const subject = line.substring(8).trim();
                const cases = [];
                i++;
                while (i < lines.length) {
                    const wLine = lines[i];
                    const wUpper = wLine.toUpperCase();
                    if (wUpper.startsWith('END-EVALUATE')) { i++; break; }
                    if (wUpper.startsWith('WHEN OTHER')) {
                        i++;
                        const bodyLines = [];
                        while (i < lines.length && !lines[i].toUpperCase().startsWith('WHEN ') && !lines[i].toUpperCase().startsWith('END-EVALUATE')) {
                            bodyLines.push(lines[i]); i++;
                        }
                        const body = this._parseBlock(bodyLines, 0);
                        cases.push({ condition: 'OTHER', body: body.stmts });
                    } else if (wUpper.startsWith('WHEN ')) {
                        const cond = wLine.substring(5).trim();
                        i++;
                        const bodyLines = [];
                        while (i < lines.length && !lines[i].toUpperCase().startsWith('WHEN ') && !lines[i].toUpperCase().startsWith('END-EVALUATE')) {
                            bodyLines.push(lines[i]); i++;
                        }
                        const body = this._parseBlock(bodyLines, 0);
                        cases.push({ condition: cond, body: body.stmts });
                    } else { i++; }
                }
                stmts.push({ type: 'EVALUATE', subject: subject.toUpperCase(), cases });
                continue;
            }

            // PERFORM VARYING
            const perfV = upper.match(/^PERFORM\s+VARYING\s+([A-Z0-9\-_]+)\s+FROM\s+(\S+)\s+BY\s+(\S+)\s+UNTIL\s+([A-Z0-9\-_]+)\s*(>|<|>=|<=|=)\s*(\S+)/i);
            if (perfV) {
                i++;
                const body = this._parseBlock(lines, i);
                i = body.nextIndex;
                if (i < lines.length && lines[i].toUpperCase().startsWith('END-PERFORM')) i++;
                stmts.push({ type: 'PERFORM_VARYING', counter: perfV[1], from: perfV[2], by: perfV[3], limitVar: perfV[4], limitOp: perfV[5], limitVal: perfV[6], body: body.stmts });
                continue;
            }

            // PERFORM n TIMES
            const perfT = upper.match(/^PERFORM\s+(\d+)\s+TIMES/i);
            if (perfT) {
                i++;
                const body = this._parseBlock(lines, i);
                i = body.nextIndex;
                if (i < lines.length && lines[i].toUpperCase().startsWith('END-PERFORM')) i++;
                stmts.push({ type: 'PERFORM_TIMES', times: Number(perfT[1]), body: body.stmts });
                continue;
            }

            // PERFORM paragraph-name (with optional THRU)
            const perfPara = upper.match(/^PERFORM\s+([A-Z][A-Z0-9\-_]+)(?:\s+THRU\s+([A-Z][A-Z0-9\-_]+))?\s*$/i);
            if (perfPara && !upper.match(/^PERFORM\s+(VARYING|UNTIL|\d)/i)) {
                stmts.push({ type: 'PERFORM_PARAGRAPH', paragraph: perfPara[1].toUpperCase(), thru: perfPara[2] ? perfPara[2].toUpperCase() : null });
                i++; continue;
            }

            // PERFORM paragraph UNTIL condition
            const perfUntil = upper.match(/^PERFORM\s+([A-Z][A-Z0-9\-_]+)\s+UNTIL\s+(.+)/i);
            if (perfUntil) {
                stmts.push({ type: 'PERFORM_UNTIL', paragraph: perfUntil[1].toUpperCase(), condition: perfUntil[2].trim().toUpperCase() });
                i++; continue;
            }

            // GO TO
            const goTo = upper.match(/^GO\s+TO\s+([A-Z][A-Z0-9\-_]+)/i);
            if (goTo) {
                stmts.push({ type: 'GO_TO', paragraph: goTo[1].toUpperCase() });
                i++; continue;
            }

            // IF / ELSE / END-IF
            if (upper.startsWith('IF ')) {
                const condStr = line.replace(/^IF\s+/i, '').replace(/\s+THEN\s*$/i, '').trim().toUpperCase();
                i++;
                const ifBody = this._parseBlock(lines, i);
                i = ifBody.nextIndex;
                let elseBody = { stmts: [] };
                if (i < lines.length && lines[i].toUpperCase().trim() === 'ELSE') {
                    i++;
                    elseBody = this._parseBlock(lines, i);
                    i = elseBody.nextIndex;
                }
                if (i < lines.length && lines[i].toUpperCase().startsWith('END-IF')) i++;
                stmts.push({ type: 'IF', condition: condStr, ifBody: ifBody.stmts, elseBody: elseBody.stmts });
                continue;
            }

            // ACCEPT
            if (upper.startsWith('ACCEPT')) {
                const varName = upper.replace(/^ACCEPT\s+/, '').trim();
                stmts.push({ type: 'ACCEPT', variable: varName });
                i++; continue;
            }

            // DISPLAY
            if (upper.startsWith('DISPLAY')) {
                const raw = line.substring(7).trim();
                stmts.push({ type: 'DISPLAY', parts: this._parseDisplayParts(raw) });
                i++; continue;
            }

            // STRING ... INTO ... END-STRING
            if (upper.startsWith('STRING')) {
                const stringContent = line.substring(6).trim();
                let fullStmt = stringContent;
                i++;
                while (i < lines.length && !lines[i].toUpperCase().startsWith('END-STRING')) {
                    fullStmt += ' ' + lines[i].trim();
                    i++;
                }
                if (i < lines.length && lines[i].toUpperCase().startsWith('END-STRING')) i++;
                const intoMatch = fullStmt.match(/(.+?)\s+INTO\s+([A-Z0-9\-_]+)/i);
                if (intoMatch) {
                    const sources = this._parseStringParts(intoMatch[1]);
                    stmts.push({ type: 'STRING_OP', sources, target: intoMatch[2].toUpperCase() });
                }
                continue;
            }

            // UNSTRING ... DELIMITED BY ... INTO ... END-UNSTRING
            if (upper.startsWith('UNSTRING')) {
                const unstringContent = line.substring(8).trim();
                let fullStmt = unstringContent;
                i++;
                while (i < lines.length && !lines[i].toUpperCase().startsWith('END-UNSTRING')) {
                    fullStmt += ' ' + lines[i].trim();
                    i++;
                }
                if (i < lines.length && lines[i].toUpperCase().startsWith('END-UNSTRING')) i++;
                const dMatch = fullStmt.match(/([A-Z0-9\-_]+)\s+DELIMITED\s+BY\s+(\S+)\s+INTO\s+(.+)/i);
                if (dMatch) {
                    const targets = dMatch[3].split(/[,\s]+/).filter(x => x).map(x => x.toUpperCase());
                    stmts.push({ type: 'UNSTRING_OP', source: dMatch[1].toUpperCase(), delimiter: dMatch[2].replace(/^["']|["']$/g, ''), targets });
                }
                continue;
            }

            // INSPECT (basic TALLYING/REPLACING)
            if (upper.startsWith('INSPECT')) {
                const inspectContent = line.substring(7).trim();
                const replM = inspectContent.match(/([A-Z0-9\-_]+)\s+REPLACING\s+ALL\s+["']([^"']+)["']\s+BY\s+["']([^"']+)["']/i);
                if (replM) {
                    stmts.push({ type: 'INSPECT_REPLACING', variable: replM[1].toUpperCase(), search: replM[2], replace: replM[3] });
                }
                i++; continue;
            }

            // INITIALIZE
            if (upper.startsWith('INITIALIZE')) {
                const varName = upper.replace(/^INITIALIZE\s+/, '').trim();
                stmts.push({ type: 'INITIALIZE', variable: varName });
                i++; continue;
            }

            // SET
            if (upper.startsWith('SET')) {
                const setM = upper.match(/^SET\s+([A-Z0-9\-_]+)\s+TO\s+(.+)/i);
                if (setM) {
                    stmts.push({ type: 'MOVE', source: setM[2].trim(), target: setM[1].trim() });
                }
                i++; continue;
            }

            // MOVE
            const moveM = upper.match(/^MOVE\s+(.+?)\s+TO\s+([A-Z0-9\-_]+)/i);
            if (moveM) {
                stmts.push({ type: 'MOVE', source: moveM[1].trim(), target: moveM[2].trim() });
                i++; continue;
            }

            // COMPUTE
            const compM = upper.match(/^COMPUTE\s+([A-Z0-9\-_]+)\s*=\s*(.+)/i);
            if (compM) {
                stmts.push({ type: 'COMPUTE', variable: compM[1].trim(), expression: compM[2].trim() });
                i++; continue;
            }

            // ADD
            if (upper.startsWith('ADD')) {
                const ag = upper.match(/^ADD\s+(.+?)\s+GIVING\s+([A-Z0-9\-_,\s]+)/i);
                if (ag) { stmts.push({ type: 'ADD_GIVING', sources: ag[1].trim(), targets: ag[2].trim() }); }
                else {
                    const am = upper.match(/^ADD\s+(.+?)\s+TO\s+([A-Z0-9\-_,\s]+)/i);
                    if (am) stmts.push({ type: 'ADD', sources: am[1].trim(), targets: am[2].trim() });
                }
                i++; continue;
            }

            // SUBTRACT
            if (upper.startsWith('SUBTRACT')) {
                const sg = upper.match(/^SUBTRACT\s+(.+?)\s+FROM\s+(.+?)\s+GIVING\s+([A-Z0-9\-_,\s]+)/i);
                if (sg) { stmts.push({ type: 'SUBTRACT_GIVING', sources: sg[1].trim(), from: sg[2].trim(), targets: sg[3].trim() }); }
                else {
                    const sm = upper.match(/^SUBTRACT\s+(.+?)\s+FROM\s+([A-Z0-9\-_,\s]+)/i);
                    if (sm) stmts.push({ type: 'SUBTRACT', sources: sm[1].trim(), targets: sm[2].trim() });
                }
                i++; continue;
            }

            // MULTIPLY
            if (upper.startsWith('MULTIPLY')) {
                const mg = upper.match(/^MULTIPLY\s+(.+?)\s+BY\s+(.+?)\s+GIVING\s+([A-Z0-9\-_,\s]+)/i);
                if (mg) { stmts.push({ type: 'MULTIPLY_GIVING', source: mg[1].trim(), by: mg[2].trim(), targets: mg[3].trim() }); }
                else {
                    const mm = upper.match(/^MULTIPLY\s+(.+?)\s+BY\s+([A-Z0-9\-_,\s]+)/i);
                    if (mm) stmts.push({ type: 'MULTIPLY', source: mm[1].trim(), targets: mm[2].trim() });
                }
                i++; continue;
            }

            // DIVIDE
            if (upper.startsWith('DIVIDE')) {
                const dg = upper.match(/^DIVIDE\s+(.+?)\s+BY\s+(.+?)\s+GIVING\s+([A-Z0-9\-_]+)(?:\s+REMAINDER\s+([A-Z0-9\-_]+))?/i);
                if (dg) { stmts.push({ type: 'DIVIDE_GIVING', dividend: dg[1].trim(), divisor: dg[2].trim(), target: dg[3].trim(), remainder: dg[4] ? dg[4].trim() : null }); }
                else {
                    const di = upper.match(/^DIVIDE\s+(.+?)\s+INTO\s+([A-Z0-9\-_]+)/i);
                    if (di) stmts.push({ type: 'DIVIDE_INTO', divisor: di[1].trim(), target: di[2].trim() });
                }
                i++; continue;
            }

            i++;
        }
        return { stmts, nextIndex: i };
    }

    /** Parse STRING sources (items DELIMITED BY ...) */
    _parseStringParts(content) {
        const parts = [];
        const re = /\s*("[^"]*"|'[^']*'|[A-Z0-9\-_]+)\s+DELIMITED\s+BY\s+(SIZE|SPACE|[A-Z0-9\-_]+|"[^"]*"|'[^']*')/gi;
        let m;
        while ((m = re.exec(content)) !== null) {
            const src = m[1].replace(/^["']|["']$/g, '');
            parts.push({ source: src, isLiteral: m[1].startsWith('"') || m[1].startsWith("'") });
        }
        return parts;
    }

    /** Parse DISPLAY argument into parts: [{type:'string',value}, {type:'var',name}] */
    _parseDisplayParts(raw) {
        const parts = [];
        const segments = raw.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.trim()).filter(s => s);
        for (const segment of segments) {
            const tokens = segment.match(/["'][^"']*["']|[^\s"']+/g) || [];
            for (const tok of tokens) {
                if ((tok.startsWith('"') && tok.endsWith('"')) || (tok.startsWith("'") && tok.endsWith("'"))) {
                    parts.push({ type: 'string', value: tok.slice(1, -1) });
                } else {
                    parts.push({ type: 'var', name: tok.toUpperCase() });
                }
            }
        }
        return parts;
    }

    // =====================================================================
    //  HELPERS
    // =====================================================================
    cv(name) { return name.toLowerCase().replace(/^ws-/, '').replace(/-/g, '_').replace(/["']/g, ''); }
    /** Invert a COBOL UNTIL operator to a while-loop operator */
    _invertOp(op) { return { '>': '<=', '>=': '<', '<': '>=', '<=': '>', '=': '!=' }[op] || '<='; }
    /** Check if any statements use STRING/UNSTRING/INSPECT_REPLACING */
    _usesStringOps(stmts, paragraphs) {
        const check = (list) => list.some(s => s.type === 'STRING_OP' || s.type === 'UNSTRING_OP' || s.type === 'INSPECT_REPLACING' || (s.body && check(s.body)) || (s.ifBody && check(s.ifBody)) || (s.elseBody && check(s.elseBody)));
        if (check(stmts)) return true;
        for (const body of Object.values(paragraphs || {})) { if (check(body)) return true; }
        return false;
    }
    convertExpr(expr, lang) {
        let e = expr.replace(/[A-Z][A-Z0-9\-_]*/gi, m => isNaN(m) ? this.cv(m) : m);
        // Use integer division for languages that need it
        if (lang === 'python') e = e.replace(/\//g, '//');
        else if (lang === 'javascript') {
            if (e.includes('/')) e = `Math.floor(${e})`;
        }
        return e;
    }
    _splitList(s) { return s.split(/[,\s]+/).filter(x => x); }
    _mapSources(s) { return this._splitList(s).map(x => isNaN(x) ? this.cv(x) : x); }
    _cVal(src) {
        const s = src.replace(/^["']|["']$/g, '');
        if (src.startsWith('"') || src.startsWith("'")) return `"${s}"`;
        if (!isNaN(s)) return s;
        return this.cv(s);
    }
    _cCondition(cond) {
        let c = cond.replace(/"[^"]*"|'[^']*'|[A-Z][A-Z0-9\-_]*/gi, m => {
            if (m.startsWith('"') || m.startsWith("'")) return m;
            return isNaN(m) ? this.cv(m) : m;
        });
        c = c.replace(/(?<![<>!])=(?!=)/g, ' == ');
        return c.replace(/\s+/g, ' ').trim();
    }

    // =====================================================================
    //  CONVERT ENTRY POINT
    // =====================================================================
    convert() {
        const input = document.getElementById('cobolInput');
        const cobolCode = input.value.trim();
        if (!cobolCode) { this.showNotification('Please enter COBOL code to convert', 'error'); return; }
        this.showLoading(true);
        setTimeout(() => {
            try {
                const converted = this.performConversion(cobolCode);
                this.displayResult(converted);
                this.showLoading(false);
                this.showNotification('Code converted successfully!', 'success');
            } catch (error) {
                console.error('Conversion error:', error);
                this.showLoading(false);
                this.showNotification('Conversion failed: ' + error.message, 'error');
            }
        }, 500);
    }

    performConversion(cobolCode) {
        const addComments = document.getElementById('addComments').checked;
        switch (this.currentLanguage) {
            case 'python': return this.convertToPython(cobolCode, addComments);
            case 'java': return this.convertToJava(cobolCode, addComments);
            case 'csharp': return this.convertToCSharp(cobolCode, addComments);
            case 'javascript': return this.convertToJavaScript(cobolCode, addComments);
            case 'go': return this.convertToGo(cobolCode, addComments);
            case 'rust': return this.convertToRust(cobolCode, addComments);
            default: return 'Conversion not implemented for this language.';
        }
    }

    // =====================================================================
    //  GENERIC ARITHMETIC BLOCK GENERATOR
    // =====================================================================
    _genArith(s, ind, semi, lang) {
        const sc = semi ? ';' : '';
        lang = lang || 'python';
        let r = '';
        switch (s.type) {
            case 'ADD': {
                const srcs = this._mapSources(s.sources).join(' + ');
                for (const t of this._splitList(s.targets)) { const tn = this.cv(t); r += `${ind}${tn} = ${tn} + ${srcs}${sc}\n`; }
                break;
            }
            case 'ADD_GIVING': {
                const srcs = this._mapSources(s.sources).join(' + ');
                for (const t of this._splitList(s.targets)) r += `${ind}${this.cv(t)} = ${srcs}${sc}\n`;
                break;
            }
            case 'SUBTRACT': {
                const srcs = this._mapSources(s.sources).join(' + ');
                for (const t of this._splitList(s.targets)) { const tn = this.cv(t); r += `${ind}${tn} = ${tn} - (${srcs})${sc}\n`; }
                break;
            }
            case 'SUBTRACT_GIVING': {
                const srcs = this._mapSources(s.sources).join(' + ');
                for (const t of this._splitList(s.targets)) r += `${ind}${this.cv(t)} = ${this.cv(s.from)} - (${srcs})${sc}\n`;
                break;
            }
            case 'MULTIPLY': {
                const v = isNaN(s.source) ? this.cv(s.source) : s.source;
                for (const t of this._splitList(s.targets)) { const tn = this.cv(t); r += `${ind}${tn} = ${tn} * ${v}${sc}\n`; }
                break;
            }
            case 'MULTIPLY_GIVING': {
                const a = isNaN(s.source) ? this.cv(s.source) : s.source, b = isNaN(s.by) ? this.cv(s.by) : s.by;
                for (const t of this._splitList(s.targets)) r += `${ind}${this.cv(t)} = ${a} * ${b}${sc}\n`;
                break;
            }
            case 'DIVIDE_GIVING': {
                const a = isNaN(s.dividend) ? this.cv(s.dividend) : s.dividend, b = isNaN(s.divisor) ? this.cv(s.divisor) : s.divisor;
                if (lang === 'python') {
                    r += `${ind}${this.cv(s.target)} = ${a} // ${b}${sc}\n`;
                    if (s.remainder) r += `${ind}${this.cv(s.remainder)} = ${a} % ${b}${sc}\n`;
                } else if (lang === 'javascript') {
                    r += `${ind}${this.cv(s.target)} = Math.floor(${a} / ${b})${sc}\n`;
                    if (s.remainder) r += `${ind}${this.cv(s.remainder)} = ${a} % ${b}${sc}\n`;
                } else {
                    r += `${ind}${this.cv(s.target)} = ${a} / ${b}${sc}\n`;
                    if (s.remainder) r += `${ind}${this.cv(s.remainder)} = ${a} % ${b}${sc}\n`;
                }
                break;
            }
            case 'DIVIDE_INTO': {
                const d = isNaN(s.divisor) ? this.cv(s.divisor) : s.divisor; const tn = this.cv(s.target);
                if (lang === 'python') {
                    r += `${ind}${tn} = ${tn} // ${d}${sc}\n`;
                } else if (lang === 'javascript') {
                    r += `${ind}${tn} = Math.floor(${tn} / ${d})${sc}\n`;
                } else {
                    r += `${ind}${tn} = ${tn} / ${d}${sc}\n`;
                }
                break;
            }
        }
        return r;
    }

    // =====================================================================
    //  PYTHON
    // =====================================================================
    convertToPython(code, cmt) {
        const vars = this.parseVariables(code);
        const stmts = this.parseStatements(code);
        this._knownVars = new Set(vars.map(v => v.name.toUpperCase()));
        const paragraphs = stmts._paragraphs || {};
        let r = '';
        if (cmt) r += '# Converted from COBOL to Python\n# Generated by COBOL Converter\n\n';
        r += 'def main():\n';
        if (vars.length) {
            if (cmt) r += '    # Variable declarations\n';
            for (const v of vars) {
                if (v.type === '88-level') continue;
                const n = this.cv(v.name);
                r += v.type === 'string' ? `    ${n} = "${v.value}"\n` : `    ${n} = ${v.value}\n`;
            }
            r += '\n';
        }

        // Generate paragraph functions as nested functions
        if (Object.keys(paragraphs).length > 0) {
            const varNames = vars.filter(v => v.type !== '88-level').map(v => this.cv(v.name));
            for (const [name, body] of Object.entries(paragraphs)) {
                const fnName = this.cv(name);
                r += `    def ${fnName}():\n`;
                if (varNames.length > 0) {
                    r += `        nonlocal ${varNames.join(', ')}\n`;
                }
                r += this._pyBlock(body, '        ', false);
                if (body.length === 0) r += '        pass\n';
                r += '\n';
            }
        }

        r += this._pyBlock(stmts, '    ', cmt);
        r += '\nif __name__ == "__main__":\n    main()\n';
        return r;
    }

    _pyBlock(stmts, ind, cmt) {
        let r = '';
        for (const s of stmts) {
            switch (s.type) {
                case 'DISPLAY': {
                    const args = s.parts.map(p => {
                        if (p.type === 'string') return `"${p.value}"`;
                        if (this._knownVars && !this._knownVars.has(p.name.toUpperCase())) return `"${p.name}"`;
                        return this.cv(p.name);
                    });
                    r += args.length === 1 ? `${ind}print(${args[0]})\n` : `${ind}print(${args.join(', ')}, sep="")\n`;
                    break;
                }
                case 'ACCEPT': {
                    const vn = this.cv(s.variable);
                    r += `${ind}${vn} = input()\n`;
                    break;
                }
                case 'MOVE': r += `${ind}${this.cv(s.target)} = ${this._pyVal(s.source)}\n`; break;
                case 'COMPUTE': r += `${ind}${this.cv(s.variable)} = ${this.convertExpr(s.expression, 'python')}\n`; break;
                case 'ADD': case 'ADD_GIVING': case 'SUBTRACT': case 'SUBTRACT_GIVING':
                case 'MULTIPLY': case 'MULTIPLY_GIVING': case 'DIVIDE_GIVING': case 'DIVIDE_INTO':
                    r += this._genArith(s, ind, false, 'python');
                    break;
                case 'PERFORM_VARYING': {
                    const c = this.cv(s.counter);
                    const whileOp = this._invertOp(s.limitOp);
                    r += `${ind}${c} = ${isNaN(s.from) ? this.cv(s.from) : s.from}\n`;
                    r += `${ind}while ${c} ${whileOp} ${isNaN(s.limitVal) ? this.cv(s.limitVal) : s.limitVal}:\n`;
                    r += this._pyBlock(s.body, ind + '    ', false);
                    r += `${ind}    ${c} += ${isNaN(s.by) ? this.cv(s.by) : s.by}\n`;
                    break;
                }
                case 'PERFORM_TIMES': {
                    r += `${ind}for _i in range(${s.times}):\n`;
                    r += this._pyBlock(s.body, ind + '    ', false);
                    if (s.body.length === 0) r += `${ind}    pass\n`;
                    break;
                }
                case 'IF': {
                    r += `${ind}if ${this._pyCondition(s.condition)}:\n`;
                    r += this._pyBlock(s.ifBody, ind + '    ', false);
                    if (s.ifBody.length === 0) r += `${ind}    pass\n`;
                    if (s.elseBody.length > 0) {
                        r += `${ind}else:\n`;
                        r += this._pyBlock(s.elseBody, ind + '    ', false);
                    }
                    break;
                }
                case 'EVALUATE': {
                    r += this._pyEvaluate(s, ind);
                    break;
                }
                case 'PERFORM_PARAGRAPH': {
                    r += `${ind}${this.cv(s.paragraph)}()\n`;
                    break;
                }
                case 'PERFORM_UNTIL': {
                    r += `${ind}while not (${this._pyCondition(s.condition)}):\n`;
                    r += `${ind}    ${this.cv(s.paragraph)}()\n`;
                    break;
                }
                case 'GO_TO': {
                    r += `${ind}# GO TO ${s.paragraph} (converted to function call)\n`;
                    r += `${ind}${this.cv(s.paragraph)}()\n`;
                    r += `${ind}return\n`;
                    break;
                }
                case 'STRING_OP': {
                    const target = this.cv(s.target);
                    const parts = s.sources.map(p => p.isLiteral ? `"${p.source}"` : `str(${this.cv(p.source)}).strip()`);
                    r += `${ind}${target} = ${parts.join(' + ')}\n`;
                    break;
                }
                case 'UNSTRING_OP': {
                    const src = this.cv(s.source);
                    r += `${ind}_parts = ${src}.split("${s.delimiter}")\n`;
                    s.targets.forEach((t, idx) => {
                        r += `${ind}${this.cv(t)} = _parts[${idx}] if len(_parts) > ${idx} else ""\n`;
                    });
                    break;
                }
                case 'INSPECT_REPLACING': {
                    const vn = this.cv(s.variable);
                    r += `${ind}${vn} = ${vn}.replace("${s.search}", "${s.replace}")\n`;
                    break;
                }
                case 'INITIALIZE': {
                    const vn = this.cv(s.variable);
                    r += `${ind}${vn} = 0\n`;
                    break;
                }
            }
        }
        return r;
    }

    _pyEvaluate(s, ind) {
        let r = '';
        const subj = s.subject.toUpperCase();
        let first = true;
        for (const c of s.cases) {
            const keyword = first ? 'if' : 'elif';
            first = false;
            if (c.condition === 'OTHER') {
                r += `${ind}else:\n`;
            } else if (subj === 'TRUE') {
                r += `${ind}${keyword} ${this._pyCondition(c.condition)}:\n`;
            } else {
                r += `${ind}${keyword} ${this.cv(subj)} == ${this._pyVal(c.condition)}:\n`;
            }
            r += this._pyBlock(c.body, ind + '    ', false);
            if (c.body.length === 0) r += `${ind}    pass\n`;
        }
        return r;
    }

    _pyVal(src) {
        const s = src.replace(/^["']|["']$/g, '');
        if (src.startsWith('"') || src.startsWith("'")) return `"${s}"`;
        if (!isNaN(s)) return s;
        return this.cv(s);
    }

    _pyCondition(cond) {
        return cond.replace(/"[^"]*"|'[^']*'|[A-Z][A-Z0-9\-_]*/gi, m => {
            if (m.startsWith('"') || m.startsWith("'")) return m;
            return isNaN(m) ? this.cv(m) : m;
        }).replace(/(?<![<>!])=(?!=)/g, ' == ').replace(/\s+/g, ' ').trim();
    }

    // =====================================================================
    //  JAVA
    // =====================================================================
    convertToJava(code, cmt) {
        const vars = this.parseVariables(code);
        const stmts = this.parseStatements(code);
        this._knownVars = new Set(vars.map(v => v.name.toUpperCase()));
        const paragraphs = stmts._paragraphs || {};
        let r = '';
        if (cmt) r += '// Converted from COBOL to Java\n// Generated by COBOL Converter\n\n';
        r += 'public class COBOLProgram {\n';

        if (Object.keys(paragraphs).length > 0) {
            for (const v of vars) {
                if (v.type === '88-level') continue;
                const n = this.cv(v.name);
                r += v.type === 'string' ? `    static String ${n} = "${v.value}";\n` : `    static int ${n} = ${v.value};\n`;
            }
            r += '\n';
            for (const [name, body] of Object.entries(paragraphs)) {
                const fnName = this.cv(name);
                r += `    static void ${fnName}() {\n`;
                r += this._cBlock(body, '        ', 'java');
                r += '    }\n\n';
            }
        }

        r += '    public static void main(String[] args) {\n';
        if (Object.keys(paragraphs).length === 0) {
            if (vars.length) {
                if (cmt) r += '        // Variable declarations\n';
                for (const v of vars) {
                    if (v.type === '88-level') continue;
                    const n = this.cv(v.name);
                    r += v.type === 'string' ? `        String ${n} = "${v.value}";\n` : `        int ${n} = ${v.value};\n`;
                }
                r += '\n';
            }
        }
        r += this._cBlock(stmts, '        ', 'java');
        r += '    }\n}\n';
        return r;
    }

    // =====================================================================
    //  C#
    // =====================================================================
    convertToCSharp(code, cmt) {
        const vars = this.parseVariables(code);
        const stmts = this.parseStatements(code);
        this._knownVars = new Set(vars.map(v => v.name.toUpperCase()));
        const paragraphs = stmts._paragraphs || {};
        let r = '';
        if (cmt) r += '// Converted from COBOL to C#\n// Generated by COBOL Converter\n\n';
        r += 'using System;\n\nnamespace COBOLProgram\n{\n    class Program\n    {\n';

        if (Object.keys(paragraphs).length > 0) {
            for (const v of vars) {
                if (v.type === '88-level') continue;
                const n = this.cv(v.name);
                r += v.type === 'string' ? `        static string ${n} = "${v.value}";\n` : `        static int ${n} = ${v.value};\n`;
            }
            r += '\n';
            for (const [name, body] of Object.entries(paragraphs)) {
                const fnName = this.cv(name);
                r += `        static void ${fnName}() {\n`;
                r += this._cBlock(body, '            ', 'csharp');
                r += '        }\n\n';
            }
        }

        r += '        static void Main(string[] args)\n        {\n';
        if (Object.keys(paragraphs).length === 0) {
            if (vars.length) {
                if (cmt) r += '            // Variable declarations\n';
                for (const v of vars) {
                    if (v.type === '88-level') continue;
                    const n = this.cv(v.name);
                    r += v.type === 'string' ? `            string ${n} = "${v.value}";\n` : `            int ${n} = ${v.value};\n`;
                }
                r += '\n';
            }
        }
        r += this._cBlock(stmts, '            ', 'csharp');
        r += '        }\n    }\n}\n';
        return r;
    }

    // =====================================================================
    //  JAVASCRIPT
    // =====================================================================
    convertToJavaScript(code, cmt) {
        const vars = this.parseVariables(code);
        const stmts = this.parseStatements(code);
        this._knownVars = new Set(vars.map(v => v.name.toUpperCase()));
        const paragraphs = stmts._paragraphs || {};
        let r = '';
        if (cmt) r += '// Converted from COBOL to JavaScript\n// Generated by COBOL Converter\n\n';
        r += 'function main() {\n';
        if (vars.length) {
            if (cmt) r += '    // Variable declarations\n';
            for (const v of vars) {
                if (v.type === '88-level') continue;
                const n = this.cv(v.name);
                r += v.type === 'string' ? `    let ${n} = "${v.value}";\n` : `    let ${n} = ${v.value};\n`;
            }
            r += '\n';
        }

        for (const [name, body] of Object.entries(paragraphs)) {
            const fnName = this.cv(name);
            r += `    function ${fnName}() {\n`;
            r += this._cBlock(body, '        ', 'javascript');
            r += '    }\n\n';
        }

        r += this._cBlock(stmts, '    ', 'javascript');
        r += '}\n\nmain();\n';
        return r;
    }

    // =====================================================================
    //  GO
    // =====================================================================
    convertToGo(code, cmt) {
        const vars = this.parseVariables(code);
        const stmts = this.parseStatements(code);
        this._knownVars = new Set(vars.map(v => v.name.toUpperCase()));
        const paragraphs = stmts._paragraphs || {};
        const needsStrings = this._usesStringOps(stmts, paragraphs);
        let r = '';
        if (cmt) r += '// Converted from COBOL to Go\n// Generated by COBOL Converter\n\n';
        if (needsStrings) {
            r += 'package main\n\nimport (\n    "fmt"\n    "strings"\n)\n\n';
        } else {
            r += 'package main\n\nimport "fmt"\n\n';
        }

        if (Object.keys(paragraphs).length > 0) {
            r += 'var (\n';
            for (const v of vars) {
                if (v.type === '88-level') continue;
                const n = this.cv(v.name);
                if (v.value !== '' && v.value !== 0) {
                    r += v.type === 'string' ? `    ${n} string = "${v.value}"\n` : `    ${n} int = ${v.value}\n`;
                } else {
                    r += v.type === 'string' ? `    ${n} string\n` : `    ${n} int\n`;
                }
            }
            r += ')\n\n';
            for (const [name, body] of Object.entries(paragraphs)) {
                const fnName = this.cv(name);
                r += `func ${fnName}() {\n`;
                r += this._cBlock(body, '    ', 'go');
                r += '}\n\n';
            }
        }

        r += 'func main() {\n';
        if (Object.keys(paragraphs).length === 0) {
            if (vars.length) {
                if (cmt) r += '    // Variable declarations\n';
                for (const v of vars) {
                    if (v.type === '88-level') continue;
                    const n = this.cv(v.name);
                    if (v.value !== '' && v.value !== 0) {
                        r += v.type === 'string' ? `    ${n} := "${v.value}"\n` : `    ${n} := ${v.value}\n`;
                    } else {
                        r += v.type === 'string' ? `    var ${n} string = ""\n` : `    var ${n} int = 0\n`;
                    }
                }
                r += '\n';
            }
        }
        r += this._cBlock(stmts, '    ', 'go');
        r += '}\n';
        return r;
    }

    // =====================================================================
    //  RUST
    // =====================================================================
    convertToRust(code, cmt) {
        const vars = this.parseVariables(code);
        const stmts = this.parseStatements(code);
        this._knownVars = new Set(vars.map(v => v.name.toUpperCase()));
        const paragraphs = stmts._paragraphs || {};
        let r = '';
        if (cmt) r += '// Converted from COBOL to Rust\n// Generated by COBOL Converter\n\n';
        r += 'fn main() {\n';
        if (vars.length) {
            if (cmt) r += '    // Variable declarations\n';
            for (const v of vars) {
                if (v.type === '88-level') continue;
                const n = this.cv(v.name);
                r += v.type === 'string'
                    ? `    let mut ${n} = String::from("${v.value}");\n`
                    : `    let mut ${n}: i64 = ${v.value};\n`;
            }
            r += '\n';
        }

        // Rust closures for paragraphs (note: mutable closures can be complex, using simple approach)
        for (const [name, body] of Object.entries(paragraphs)) {
            const fnName = this.cv(name);
            r += `    // Paragraph: ${name}\n`;
            r += `    let ${fnName} = || {\n`;
            r += this._cBlock(body, '        ', 'rust');
            r += '    };\n\n';
        }

        r += this._cBlock(stmts, '    ', 'rust');
        r += '}\n';
        return r;
    }

    // =====================================================================
    //  UNIFIED C-FAMILY BLOCK GENERATOR
    // =====================================================================
    _cBlock(stmts, ind, lang) {
        const semi = lang !== 'go';
        const sc = semi ? ';' : '';
        let r = '';
        for (const s of stmts) {
            switch (s.type) {
                case 'DISPLAY':
                    r += `${ind}${this._langPrint(s.parts, lang)}${sc}\n`;
                    break;
                case 'ACCEPT': {
                    const vn = this.cv(s.variable);
                    if (lang === 'java') r += `${ind}${vn} = new java.util.Scanner(System.in).nextLine()${sc}\n`;
                    else if (lang === 'csharp') r += `${ind}${vn} = Console.ReadLine()${sc}\n`;
                    else if (lang === 'javascript') r += `${ind}${vn} = prompt("")${sc}\n`;
                    else if (lang === 'go') r += `${ind}fmt.Scanln(&${vn})\n`;
                    else if (lang === 'rust') r += `${ind}let mut _input = String::new();\n${ind}std::io::stdin().read_line(&mut _input).unwrap();\n${ind}${vn} = _input.trim().to_string();\n`;
                    break;
                }
                case 'MOVE':
                    r += `${ind}${this.cv(s.target)} = ${lang === 'rust' ? this._rustVal(s.source) : this._cVal(s.source)}${sc}\n`;
                    break;
                case 'COMPUTE':
                    r += `${ind}${this.cv(s.variable)} = ${this.convertExpr(s.expression, lang)}${sc}\n`;
                    break;
                case 'ADD': case 'ADD_GIVING': case 'SUBTRACT': case 'SUBTRACT_GIVING':
                case 'MULTIPLY': case 'MULTIPLY_GIVING': case 'DIVIDE_GIVING': case 'DIVIDE_INTO':
                    r += this._genArith(s, ind, semi, lang);
                    break;
                case 'PERFORM_VARYING': {
                    const c = this.cv(s.counter);
                    const from = isNaN(s.from) ? this.cv(s.from) : s.from;
                    const lim = isNaN(s.limitVal) ? this.cv(s.limitVal) : s.limitVal;
                    const by = isNaN(s.by) ? this.cv(s.by) : s.by;
                    const whileOp = this._invertOp(s.limitOp);
                    if (lang === 'rust') {
                        r += `${ind}${c} = ${from};\n`;
                        r += `${ind}while ${c} ${whileOp} ${lim} {\n`;
                        r += this._cBlock(s.body, ind + '    ', lang);
                        r += `${ind}    ${c} += ${by};\n`;
                        r += `${ind}}\n`;
                    } else if (lang === 'go') {
                        r += `${ind}for ${c} = ${from}; ${c} ${whileOp} ${lim}; ${c} += ${by} {\n`;
                        r += this._cBlock(s.body, ind + '    ', lang);
                        r += `${ind}}\n`;
                    } else {
                        r += `${ind}for (${c} = ${from}; ${c} ${whileOp} ${lim}; ${c} += ${by}) {\n`;
                        r += this._cBlock(s.body, ind + '    ', lang);
                        r += `${ind}}\n`;
                    }
                    break;
                }
                case 'PERFORM_TIMES': {
                    if (lang === 'rust') {
                        r += `${ind}for _i in 0..${s.times} {\n`;
                    } else if (lang === 'go') {
                        r += `${ind}for _i := 0; _i < ${s.times}; _i++ {\n`;
                    } else {
                        r += `${ind}for (let _i = 0; _i < ${s.times}; _i++) {\n`;
                    }
                    r += this._cBlock(s.body, ind + '    ', lang);
                    r += `${ind}}\n`;
                    break;
                }
                case 'IF': {
                    if (lang === 'go' || lang === 'rust') {
                        r += `${ind}if ${this._cCondition(s.condition)} {\n`;
                    } else {
                        r += `${ind}if (${this._cCondition(s.condition)}) {\n`;
                    }
                    r += this._cBlock(s.ifBody, ind + '    ', lang);
                    r += `${ind}}\n`;
                    if (s.elseBody.length > 0) {
                        r += `${ind}else {\n`;
                        r += this._cBlock(s.elseBody, ind + '    ', lang);
                        r += `${ind}}\n`;
                    }
                    break;
                }
                case 'EVALUATE': {
                    r += this._cEvaluate(s, ind, lang);
                    break;
                }
                case 'PERFORM_PARAGRAPH': {
                    r += `${ind}${this.cv(s.paragraph)}()${sc}\n`;
                    break;
                }
                case 'PERFORM_UNTIL': {
                    if (lang === 'go' || lang === 'rust') {
                        r += `${ind}for !(${this._cCondition(s.condition)}) {\n`;
                    } else {
                        r += `${ind}while (!(${this._cCondition(s.condition)})) {\n`;
                    }
                    r += `${ind}    ${this.cv(s.paragraph)}()${sc}\n`;
                    r += `${ind}}\n`;
                    break;
                }
                case 'GO_TO': {
                    r += `${ind}// GO TO ${s.paragraph} (converted to function call)\n`;
                    r += `${ind}${this.cv(s.paragraph)}()${sc}\n`;
                    r += `${ind}return${sc}\n`;
                    break;
                }
                case 'STRING_OP': {
                    const target = this.cv(s.target);
                    if (lang === 'java') {
                        const parts = s.sources.map(p => p.isLiteral ? `"${p.source}"` : `${this.cv(p.source)}.trim()`);
                        r += `${ind}${target} = ${parts.join(' + ')};\n`;
                    } else if (lang === 'csharp') {
                        const parts = s.sources.map(p => p.isLiteral ? `"${p.source}"` : `${this.cv(p.source)}.Trim()`);
                        r += `${ind}${target} = ${parts.join(' + ')};\n`;
                    } else if (lang === 'javascript') {
                        const parts = s.sources.map(p => p.isLiteral ? `"${p.source}"` : `${this.cv(p.source)}.trim()`);
                        r += `${ind}${target} = ${parts.join(' + ')};\n`;
                    } else if (lang === 'go') {
                        const parts = s.sources.map(p => p.isLiteral ? `"${p.source}"` : `strings.TrimSpace(${this.cv(p.source)})`);
                        r += `${ind}${target} = ${parts.join(' + ')}\n`;
                    } else if (lang === 'rust') {
                        const rParts = s.sources.map(p => p.isLiteral ? `String::from("${p.source}")` : `${this.cv(p.source)}.trim().to_string()`);
                        r += `${ind}${target} = vec![${rParts.join(', ')}].join("");\n`;
                    }
                    break;
                }
                case 'UNSTRING_OP': {
                    const src = this.cv(s.source);
                    if (lang === 'java') {
                        r += `${ind}String[] _parts = ${src}.split("${s.delimiter}");\n`;
                        s.targets.forEach((t, idx) => {
                            r += `${ind}${this.cv(t)} = _parts.length > ${idx} ? _parts[${idx}] : "";\n`;
                        });
                    } else if (lang === 'csharp') {
                        r += `${ind}string[] _parts = ${src}.Split("${s.delimiter}");\n`;
                        s.targets.forEach((t, idx) => {
                            r += `${ind}${this.cv(t)} = _parts.Length > ${idx} ? _parts[${idx}] : "";\n`;
                        });
                    } else if (lang === 'javascript') {
                        r += `${ind}let _parts = ${src}.split("${s.delimiter}");\n`;
                        s.targets.forEach((t, idx) => {
                            r += `${ind}${this.cv(t)} = _parts.length > ${idx} ? _parts[${idx}] : "";\n`;
                        });
                    } else if (lang === 'go') {
                        r += `${ind}_parts := strings.Split(${src}, "${s.delimiter}")\n`;
                        s.targets.forEach((t, idx) => {
                            r += `${ind}if len(_parts) > ${idx} { ${this.cv(t)} = _parts[${idx}] }\n`;
                        });
                    } else if (lang === 'rust') {
                        r += `${ind}let _parts: Vec<&str> = ${src}.split("${s.delimiter}").collect();\n`;
                        s.targets.forEach((t, idx) => {
                            r += `${ind}${this.cv(t)} = if _parts.len() > ${idx} { _parts[${idx}].to_string() } else { String::new() };\n`;
                        });
                    }
                    break;
                }
                case 'INSPECT_REPLACING': {
                    const vn = this.cv(s.variable);
                    if (lang === 'java') r += `${ind}${vn} = ${vn}.replace("${s.search}", "${s.replace}");\n`;
                    else if (lang === 'csharp') r += `${ind}${vn} = ${vn}.Replace("${s.search}", "${s.replace}");\n`;
                    else if (lang === 'javascript') r += `${ind}${vn} = ${vn}.replaceAll("${s.search}", "${s.replace}");\n`;
                    else if (lang === 'go') r += `${ind}${vn} = strings.ReplaceAll(${vn}, "${s.search}", "${s.replace}")\n`;
                    else if (lang === 'rust') r += `${ind}${vn} = ${vn}.replace("${s.search}", "${s.replace}");\n`;
                    break;
                }
                case 'INITIALIZE': {
                    const vn = this.cv(s.variable);
                    r += `${ind}${vn} = 0${sc}\n`;
                    break;
                }
            }
        }
        return r;
    }

    /** Generate EVALUATE as if/else-if chain */
    _cEvaluate(s, ind, lang) {
        let r = '';
        const subj = s.subject.toUpperCase();
        let first = true;
        for (let ci = 0; ci < s.cases.length; ci++) {
            const c = s.cases[ci];
            if (c.condition === 'OTHER') {
                if (lang === 'go' || lang === 'rust') {
                    r += `${ind}${first ? '' : '} '}else {\n`;
                } else {
                    r += `${ind}else {\n`;
                }
            } else if (subj === 'TRUE') {
                if (lang === 'go' || lang === 'rust') {
                    r += `${ind}${first ? 'if' : '} else if'} ${this._cCondition(c.condition)} {\n`;
                } else {
                    r += `${ind}${first ? 'if' : 'else if'} (${this._cCondition(c.condition)}) {\n`;
                }
            } else {
                const val = this._cVal(c.condition);
                if (lang === 'go' || lang === 'rust') {
                    r += `${ind}${first ? 'if' : '} else if'} ${this.cv(subj)} == ${val} {\n`;
                } else {
                    r += `${ind}${first ? 'if' : 'else if'} (${this.cv(subj)} == ${val}) {\n`;
                }
            }
            r += this._cBlock(c.body, ind + '    ', lang);
            first = false;
            // Close brace for non-Go/Rust, or for the last case
            if (lang !== 'go' && lang !== 'rust') {
                r += `${ind}}\n`;
            } else if (ci === s.cases.length - 1) {
                r += `${ind}}\n`;
            }
        }
        return r;
    }

    /** Generate the appropriate print statement for the language */
    _langPrint(parts, lang) {
        const resolvePart = (p) => {
            if (p.type === 'string') return { isStr: true, val: p.value };
            if (this._knownVars && !this._knownVars.has(p.name.toUpperCase())) return { isStr: true, val: p.name };
            return { isStr: false, val: this.cv(p.name) };
        };
        switch (lang) {
            case 'java': {
                const expr = parts.map(p => { const r = resolvePart(p); return r.isStr ? `"${r.val}"` : r.val; }).join(' + ');
                return `System.out.println(${expr})`;
            }
            case 'csharp': {
                const expr = parts.map(p => { const r = resolvePart(p); return r.isStr ? `"${r.val}"` : r.val; }).join(' + ');
                return `Console.WriteLine(${expr})`;
            }
            case 'javascript': {
                const expr = parts.map(p => { const r = resolvePart(p); return r.isStr ? `"${r.val}"` : r.val; }).join(' + ');
                return `console.log(${expr})`;
            }
            case 'go': {
                if (parts.length === 1) {
                    const r = resolvePart(parts[0]);
                    return r.isStr ? `fmt.Println("${r.val}")` : `fmt.Println(${r.val})`;
                }
                const args = parts.map(p => { const r = resolvePart(p); return r.isStr ? `"${r.val}"` : r.val; }).join(', ');
                return `fmt.Println(fmt.Sprint(${args}))`;
            }
            case 'rust': {
                const fmtParts = []; const args = [];
                for (const p of parts) {
                    const r = resolvePart(p);
                    if (r.isStr) fmtParts.push(r.val);
                    else { fmtParts.push('{}'); args.push(r.val); }
                }
                return args.length === 0
                    ? `println!("${fmtParts.join('')}")`
                    : `println!("${fmtParts.join('')}", ${args.join(', ')})`;
            }
        }
    }

    _rustVal(src) {
        const s = src.replace(/^["']|["']$/g, '');
        if (src.startsWith('"') || src.startsWith("'")) return `String::from("${s}")`;
        if (!isNaN(s)) return s;
        return this.cv(s);
    }

    // =====================================================================
    //  COBOL INTERPRETER (uses same AST)
    // =====================================================================
    interpretCOBOL(code) {
        const output = [];
        const varDefs = this.parseVariables(code);
        const variables = {};
        for (const v of varDefs) {
            if (v.type !== '88-level') variables[v.name] = v.value;
        }
        const stmts = this.parseStatements(code);
        const paragraphs = stmts._paragraphs || {};

        const resolve = (token) => {
            if (!token) return '';
            const t = token.trim().replace(/^["']|["']$/g, '');
            const upper = t.toUpperCase();
            if (upper === 'ZEROS' || upper === 'ZERO' || upper === 'ZEROES') return 0;
            if (upper === 'SPACES' || upper === 'SPACE') return '';
            if (variables.hasOwnProperty(upper)) return variables[upper];
            if (!isNaN(t)) return Number(t);
            return t;
        };

        const evalExpr = (expr) => {
            let e = expr.trim();
            e = e.replace(/[A-Z][A-Z0-9\-_]*/gi, (match) => {
                const upper = match.toUpperCase();
                if (variables.hasOwnProperty(upper)) return Number(variables[upper]) || 0;
                if (!isNaN(match)) return match;
                return '0';
            });
            try {
                const sanitized = e.replace(/[^0-9+\-*/().%\s]/g, '');
                return Function(`"use strict"; return (${sanitized})`)();
            } catch { return 0; }
        };

        const evalCondition = (condStr) => {
            const eqStr = condStr.match(/([A-Z0-9\-_]+)\s*=\s*["']([^"']*)["']/i);
            if (eqStr) return String(resolve(eqStr[1])) === eqStr[2];
            const geM = condStr.match(/([A-Z0-9\-_]+)\s*>=\s*(["']?[^\s"']+["']?)/i);
            if (geM) return Number(resolve(geM[1])) >= Number(resolve(geM[2]));
            const leM = condStr.match(/([A-Z0-9\-_]+)\s*<=\s*(["']?[^\s"']+["']?)/i);
            if (leM) return Number(resolve(leM[1])) <= Number(resolve(leM[2]));
            const gtM = condStr.match(/([A-Z0-9\-_]+)\s*>\s*(["']?[^\s"']+["']?)/i);
            if (gtM) return Number(resolve(gtM[1])) > Number(resolve(gtM[2]));
            const ltM = condStr.match(/([A-Z0-9\-_]+)\s*<\s*(["']?[^\s"']+["']?)/i);
            if (ltM) return Number(resolve(ltM[1])) < Number(resolve(ltM[2]));
            const neM = condStr.match(/([A-Z0-9\-_]+)\s*NOT\s*=\s*(["']?[^\s"']+["']?)/i);
            if (neM) return String(resolve(neM[1])) !== String(resolve(neM[2]));
            const eqM = condStr.match(/([A-Z0-9\-_]+)\s*=\s*(["']?[^\s"']+["']?)/i);
            if (eqM) return String(resolve(eqM[1])) === String(resolve(eqM[2]));
            return false;
        };

        const execute = (stmtList) => {
            for (const s of stmtList) {
                switch (s.type) {
                    case 'ACCEPT': {
                        const target = s.variable.toUpperCase();
                        if (!variables.hasOwnProperty(target)) variables[target] = 0;
                        break;
                    }
                    case 'DISPLAY': {
                        let line = '';
                        for (const p of s.parts) {
                            if (p.type === 'string') line += p.value;
                            else { const val = resolve(p.name); line += (val !== undefined && val !== null) ? val : p.name; }
                        }
                        output.push(line);
                        break;
                    }
                    case 'MOVE': {
                        const target = s.target.toUpperCase();
                        const val = resolve(s.source);
                        variables[target] = (variables.hasOwnProperty(target) && typeof variables[target] === 'number') ? (Number(val) || 0) : val;
                        break;
                    }
                    case 'COMPUTE':
                        variables[s.variable.toUpperCase()] = evalExpr(s.expression);
                        break;
                    case 'ADD': {
                        const total = this._splitList(s.sources).reduce((sum, x) => sum + (Number(resolve(x)) || 0), 0);
                        for (const t of this._splitList(s.targets)) { const tn = t.toUpperCase(); variables[tn] = (Number(variables[tn]) || 0) + total; }
                        break;
                    }
                    case 'ADD_GIVING': {
                        const total = this._splitList(s.sources).reduce((sum, x) => sum + (Number(resolve(x)) || 0), 0);
                        for (const t of this._splitList(s.targets)) variables[t.toUpperCase()] = total;
                        break;
                    }
                    case 'SUBTRACT': {
                        const total = this._splitList(s.sources).reduce((sum, x) => sum + (Number(resolve(x)) || 0), 0);
                        for (const t of this._splitList(s.targets)) { const tn = t.toUpperCase(); variables[tn] = (Number(variables[tn]) || 0) - total; }
                        break;
                    }
                    case 'SUBTRACT_GIVING': {
                        const total = this._splitList(s.sources).reduce((sum, x) => sum + (Number(resolve(x)) || 0), 0);
                        const fromVal = Number(resolve(s.from)) || 0;
                        for (const t of this._splitList(s.targets)) variables[t.toUpperCase()] = fromVal - total;
                        break;
                    }
                    case 'MULTIPLY': {
                        const val = Number(resolve(s.source)) || 0;
                        for (const t of this._splitList(s.targets)) { const tn = t.toUpperCase(); variables[tn] = (Number(variables[tn]) || 0) * val; }
                        break;
                    }
                    case 'MULTIPLY_GIVING': {
                        const a = Number(resolve(s.source)) || 0, b = Number(resolve(s.by)) || 0;
                        for (const t of this._splitList(s.targets)) variables[t.toUpperCase()] = a * b;
                        break;
                    }
                    case 'DIVIDE_GIVING': {
                        const dividend = Number(resolve(s.dividend)) || 0, divisor = Number(resolve(s.divisor)) || 1;
                        variables[s.target.toUpperCase()] = divisor !== 0 ? Math.floor(dividend / divisor) : 0;
                        if (s.remainder) variables[s.remainder.toUpperCase()] = divisor !== 0 ? dividend % divisor : 0;
                        break;
                    }
                    case 'DIVIDE_INTO': {
                        const divisor = Number(resolve(s.divisor)) || 1; const tn = s.target.toUpperCase();
                        variables[tn] = divisor !== 0 ? Math.floor((Number(variables[tn]) || 0) / divisor) : 0;
                        break;
                    }
                    case 'PERFORM_VARYING': {
                        const counter = s.counter.toUpperCase();
                        variables[counter] = Number(resolve(s.from)) || 0;
                        const by = Number(resolve(s.by)) || 1;
                        const limit = Number(resolve(s.limitVal)) || 0;
                        const cmpFns = { '>': () => variables[counter] <= limit, '>=': () => variables[counter] < limit, '<': () => variables[counter] >= limit, '<=': () => variables[counter] > limit, '=': () => variables[counter] !== limit };
                        const cmpFn = cmpFns[s.limitOp] || (() => variables[counter] <= limit);
                        let safety = 0;
                        while (cmpFn() && safety < 10000) {
                            execute(s.body);
                            variables[counter] = Number(variables[counter]) + by;
                            safety++;
                        }
                        break;
                    }
                    case 'PERFORM_TIMES': {
                        for (let t = 0; t < Math.min(s.times, 10000); t++) execute(s.body);
                        break;
                    }
                    case 'IF': {
                        if (evalCondition(s.condition)) execute(s.ifBody);
                        else execute(s.elseBody);
                        break;
                    }
                    case 'EVALUATE': {
                        const subj = s.subject.toUpperCase();
                        let matched = false;
                        for (const c of s.cases) {
                            if (matched) break;
                            if (c.condition === 'OTHER') { execute(c.body); matched = true; }
                            else if (subj === 'TRUE') {
                                if (evalCondition(c.condition)) { execute(c.body); matched = true; }
                            } else {
                                const subjVal = resolve(subj);
                                const condVal = resolve(c.condition);
                                if (String(subjVal) === String(condVal)) { execute(c.body); matched = true; }
                            }
                        }
                        break;
                    }
                    case 'PERFORM_PARAGRAPH': {
                        const paraStmts = paragraphs[s.paragraph];
                        if (paraStmts) execute(paraStmts);
                        break;
                    }
                    case 'PERFORM_UNTIL': {
                        const paraStmts = paragraphs[s.paragraph];
                        if (paraStmts) {
                            let safety = 0;
                            while (!evalCondition(s.condition) && safety < 10000) {
                                execute(paraStmts);
                                safety++;
                            }
                        }
                        break;
                    }
                    case 'GO_TO': {
                        const paraStmts = paragraphs[s.paragraph];
                        if (paraStmts) execute(paraStmts);
                        break;
                    }
                    case 'STRING_OP': {
                        let result = '';
                        for (const p of s.sources) {
                            if (p.isLiteral) result += p.source;
                            else {
                                const val = String(resolve(p.source)).trim();
                                result += val;
                            }
                        }
                        variables[s.target] = result;
                        break;
                    }
                    case 'UNSTRING_OP': {
                        const srcVal = String(resolve(s.source));
                        const parts = srcVal.split(s.delimiter);
                        s.targets.forEach((t, idx) => {
                            variables[t] = idx < parts.length ? parts[idx].trim() : '';
                        });
                        break;
                    }
                    case 'INSPECT_REPLACING': {
                        const vn = s.variable;
                        if (variables.hasOwnProperty(vn)) {
                            variables[vn] = String(variables[vn]).replace(new RegExp(s.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), s.replace);
                        }
                        break;
                    }
                    case 'INITIALIZE': {
                        const vn = s.variable;
                        if (variables.hasOwnProperty(vn)) {
                            variables[vn] = typeof variables[vn] === 'string' ? '' : 0;
                        }
                        break;
                    }
                }
            }
        };

        execute(stmts);
        return output;
    }

    // =====================================================================
    //  JAVASCRIPT SANDBOX EXECUTOR
    // =====================================================================
    executeJavaScript(code) {
        const output = [];
        const sandboxLog = (...args) => {
            output.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        };
        try {
            const cleanCode = code
                .replace(/\bprompt\s*\(\s*["']?[^"']*["']?\s*\)/g, '0')
                .replace(/\bconsole\.log\b/g, '__log__');
            const fn = new Function('__log__', cleanCode);
            fn(sandboxLog);
            return { success: true, output: output.join('\n') || '(No output)' };
        } catch (err) {
            return { success: false, output: `Runtime Error: ${err.message}` };
        }
    }

    // =====================================================================
    //  MODERN LANGUAGE TRACE-BASED SIMULATOR (v2 – Completely Rewritten)
    //  Reads generated code line-by-line and interprets it to produce
    //  the same output as the COBOL interpreter.
    // =====================================================================
    simulateModernExecution(code, language) {
        const output = [];
        const variables = {};
        const lines = code.split('\n');
        const functions = {};

        const resolveVar = (v) => {
            if (!v) return '';
            const cleaned = String(v).trim().replace(/;$/, '');
            if (variables.hasOwnProperty(cleaned)) return variables[cleaned];
            if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'")))
                return cleaned.slice(1, -1);
            if (cleaned.startsWith('String::from("') && cleaned.endsWith('")'))
                return cleaned.slice(14, -2);
            if (!isNaN(cleaned) && cleaned !== '') return Number(cleaned);
            return cleaned;
        };

        const safeEval = (expr) => {
            let e = String(expr).trim().replace(/;$/, '');
            // Unwrap type casts but keep Math.floor for integer division
            e = e.replace(/^(?:int|Integer\.parseInt|parseInt)\s*\((.+)\)$/, 'Math.floor($1)');
            e = e.replace(/\bas\s+i64\b/g, '');
            // Convert Python // to Math.floor(/)
            e = e.replace(/\/\//g, '/');
            const sorted = Object.entries(variables).sort((a, b) => b[0].length - a[0].length);
            for (const [vn, vv] of sorted) {
                const re = new RegExp(`\\b${vn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                e = e.replace(re, typeof vv === 'number' ? String(vv) : `"${vv}"`);
            }
            try {
                let result = Function(`"use strict"; return (${e})`)();
                // Integer division: floor all numeric results from division
                if (typeof result === 'number' && !Number.isInteger(result) && e.includes('/')) {
                    result = Math.floor(result);
                }
                return result;
            }
            catch { return null; }
        };

        /** Find matching closing brace from startIdx (depth starts at 1) */
        const findClosingBrace = (startIdx, endIdx) => {
            let depth = 1, j = startIdx;
            while (j < endIdx && depth > 0) {
                const l = lines[j] ? lines[j].trim() : '';
                if (!l.startsWith('//') && !l.startsWith('#') && !l.startsWith('*')) {
                    for (const ch of l) {
                        if (ch === '{') depth++;
                        if (ch === '}') { depth--; if (depth === 0) break; }
                    }
                }
                if (depth > 0) j++;
            }
            return j;
        };

        /** Find Python block end by indentation */
        const findPyBlockEnd = (startIdx, baseIndent, endIdx) => {
            let j = startIdx;
            while (j < endIdx) {
                const nextLine = lines[j];
                if (!nextLine || nextLine.trim() === '') { j++; continue; }
                if (nextLine.search(/\S/) > baseIndent) j++;
                else break;
            }
            return j;
        };

        /** Evaluate a condition string with variable substitution */
        const evalCondition = (condExpr, negate) => {
            try {
                let evalCond = condExpr;
                const sorted = Object.entries(variables).sort((a, b) => b[0].length - a[0].length);
                for (const [vn, vv] of sorted) {
                    const re = new RegExp(`\\b${vn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                    evalCond = evalCond.replace(re, typeof vv === 'number' ? String(vv) : `"${vv}"`);
                }
                let result = Function(`"use strict"; return (${evalCond})`)();
                if (negate) result = !result;
                return result;
            } catch { return false; }
        };

        /** Core execution engine */
        const exec = (startIdx, endIdx) => {
            let i = startIdx;
            let safety = 0;
            while (i < endIdx && safety < 100000) {
                safety++;
                if (i < 0 || i >= lines.length) break;
                const raw = lines[i];
                if (!raw) { i++; continue; }
                const trimmed = raw.trim();
                if (!trimmed || trimmed === '{' || trimmed === '}' || trimmed === '},' || trimmed === '});' || trimmed === '};') { i++; continue; }

                // Skip comments, imports, declarations, boilerplate
                if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) { i++; continue; }
                if (/^(import |using |package |namespace |class |public class |struct )/.test(trimmed)) { i++; continue; }
                if (/^(def main|fn main|func main|function main|public static void main|static void Main|if __name__)/.test(trimmed)) { i++; continue; }
                if (trimmed === 'pass' || trimmed === 'pass  # placeholder') { i++; continue; }
                if (/^var\s+\(/.test(trimmed)) { i++; continue; } // Go var block opening
                if (trimmed === ')' && i > 0 && /^var\s+\(/.test((lines[i-1] || '').trim())) { i++; continue; } // Go var block closing

                // Skip input statements
                if (/^(fmt\.Scanln|std::io::stdin|let\s+mut\s+_input\s*=\s*String::new)/.test(trimmed)) { i++; continue; }

                // ---- FUNCTION/PARAGRAPH DEFINITION ----
                // Python: def name():
                const pyDefMatch = trimmed.match(/^def\s+(\w+)\s*\(\)\s*:/);
                if (pyDefMatch && !trimmed.includes('main')) {
                    const fnName = pyDefMatch[1];
                    const baseIndent = raw.search(/\S/);
                    let bodyStart = i + 1;
                    // Skip nonlocal line
                    if (bodyStart < endIdx && lines[bodyStart] && lines[bodyStart].trim().startsWith('nonlocal')) bodyStart++;
                    const bodyEnd = findPyBlockEnd(bodyStart, baseIndent, endIdx);
                    functions[fnName] = { start: bodyStart, end: bodyEnd };
                    i = bodyEnd;
                    continue;
                }
                // C-family: static void name() { or func name() { or fn name() { or function name() {
                const cFuncDef = trimmed.match(/^(?:static\s+void|func|fn|function)\s+(\w+)\s*\(\)\s*\{?\s*$/);
                if (cFuncDef && !trimmed.includes('main')) {
                    const fnName = cFuncDef[1];
                    if (trimmed.includes('{')) {
                        const bodyStart = i + 1;
                        const bodyEnd = findClosingBrace(bodyStart, endIdx);
                        functions[fnName] = { start: bodyStart, end: bodyEnd };
                        i = bodyEnd + 1;
                    } else {
                        // Next line should have {
                        if (i + 1 < endIdx && lines[i + 1] && lines[i + 1].trim() === '{') {
                            const bodyStart = i + 2;
                            const bodyEnd = findClosingBrace(bodyStart, endIdx);
                            functions[fnName] = { start: bodyStart, end: bodyEnd };
                            i = bodyEnd + 1;
                        } else { i++; }
                    }
                    continue;
                }
                // Rust closure: let name = || {
                const rustClosure = trimmed.match(/^let\s+(\w+)\s*=\s*\|\|\s*\{/);
                if (rustClosure) {
                    const fnName = rustClosure[1];
                    const bodyStart = i + 1;
                    const bodyEnd = findClosingBrace(bodyStart, endIdx);
                    functions[fnName] = { start: bodyStart, end: bodyEnd };
                    i = bodyEnd + 1;
                    continue;
                }
                // Rust paragraph comment (skip)
                if (trimmed.startsWith('// Paragraph:')) { i++; continue; }

                // ---- FUNCTION CALL ----
                const callMatch = trimmed.match(/^(\w+)\(\)\s*;?\s*$/);
                if (callMatch && functions[callMatch[1]]) {
                    const fn = functions[callMatch[1]];
                    exec(fn.start, fn.end);
                    i++; continue;
                }

                // ---- RETURN / break ----
                if (/^(return|break)\s*;?\s*$/.test(trimmed)) { i++; continue; }

                // ---- FOR LOOP (C-style: Java, C#, JS, Go) ----
                const forMatch = trimmed.match(/^for\s*\(?(?:let\s+|int\s+|var\s+)?(\w+)\s*(?::=|=)\s*(\S+)\s*;\s*\1\s*(<=|<|>=|>)\s*(\S+)\s*;\s*\1\s*(?:\+\+|\+=\s*(\S+)|--|-=\s*(\S+))/);
                if (forMatch) {
                    const varName = forMatch[1];
                    const from = Number(resolveVar(forMatch[2])) || 0;
                    const op = forMatch[3];
                    const limit = Number(resolveVar(forMatch[4])) || 0;
                    const stepUp = forMatch[5] ? (Number(resolveVar(forMatch[5])) || 1) : 1;
                    const stepDown = forMatch[6] ? (Number(resolveVar(forMatch[6])) || 1) : 0;
                    const step = stepDown ? -stepDown : stepUp;
                    const bodyStart = i + 1;
                    const bodyEnd = findClosingBrace(bodyStart, endIdx);
                    variables[varName] = from;
                    let loopSafety = 0;
                    const cmpFn = { '<': () => variables[varName] < limit, '<=': () => variables[varName] <= limit, '>': () => variables[varName] > limit, '>=': () => variables[varName] >= limit }[op] || (() => false);
                    while (cmpFn() && loopSafety < 10000) {
                        exec(bodyStart, bodyEnd);
                        variables[varName] = Number(variables[varName]) + step;
                        loopSafety++;
                    }
                    i = bodyEnd + 1;
                    continue;
                }

                // ---- WHILE LOOP (all styles: Python, Rust, Go while-for, Java/C#/JS) ----
                let whileMatch = trimmed.match(/^while\s+(.+?)\s*:\s*$/); // Python: while cond:
                if (!whileMatch) whileMatch = trimmed.match(/^while\s+(.+?)\s*\{\s*$/); // Rust/Go: while cond {
                if (!whileMatch) whileMatch = trimmed.match(/^while\s*\((.+?)\)\s*\{\s*$/); // C-style: while (cond) {
                if (!whileMatch) whileMatch = trimmed.match(/^while\s*\((.+?)\)\s*$/); // while (cond)  (brace on next line)
                if (whileMatch) {
                    let condExpr = whileMatch[1].replace(/^\(+|\)+$/g, '').trim();
                    let negate = false;
                    if (/^not\s+/i.test(condExpr)) { negate = true; condExpr = condExpr.replace(/^not\s+/i, '').replace(/^\((.+)\)$/, '$1'); }
                    if (/^!\s*\(/.test(condExpr)) { negate = true; condExpr = condExpr.replace(/^!\s*\((.+)\)\s*$/, '$1'); }

                    const bodyStart = i + 1;
                    let bodyEnd;
                    if (trimmed.endsWith('{')) {
                        bodyEnd = findClosingBrace(bodyStart, endIdx);
                    } else if (trimmed.endsWith(':')) {
                        bodyEnd = findPyBlockEnd(bodyStart, raw.search(/\S/), endIdx);
                    } else {
                        // Check if next line has opening brace
                        if (bodyStart < endIdx && lines[bodyStart] && lines[bodyStart].trim() === '{') {
                            bodyEnd = findClosingBrace(bodyStart + 1, endIdx);
                        } else {
                            bodyEnd = bodyStart + 1;
                        }
                    }

                    let loopSafety = 0;
                    while (evalCondition(condExpr, negate) && loopSafety < 10000) {
                        exec(bodyStart, bodyEnd);
                        loopSafety++;
                    }
                    i = trimmed.endsWith(':') ? bodyEnd : bodyEnd + 1;
                    continue;
                }

                // ---- GO FOR as while: for !(cond) { ----
                const goForWhile = trimmed.match(/^for\s+(!?\(?.+?\)?)\s*\{/);
                if (goForWhile && !trimmed.includes(';') && !trimmed.includes(' in ') && !trimmed.includes(':=')) {
                    let condExpr = goForWhile[1];
                    let negate = false;
                    if (condExpr.startsWith('!')) { negate = true; condExpr = condExpr.substring(1).replace(/^\((.+)\)$/, '$1'); }
                    const bodyStart = i + 1;
                    const bodyEnd = findClosingBrace(bodyStart, endIdx);
                    let loopSafety = 0;
                    while (evalCondition(condExpr, negate) && loopSafety < 10000) {
                        exec(bodyStart, bodyEnd);
                        loopSafety++;
                    }
                    i = bodyEnd + 1;
                    continue;
                }

                // ---- PYTHON FOR RANGE ----
                const pyForMatch = trimmed.match(/^for\s+(\w+)\s+in\s+range\((.+?)\)\s*:/);
                if (pyForMatch) {
                    const baseIndent = raw.search(/\S/);
                    const bodyStart = i + 1;
                    const bodyEnd = findPyBlockEnd(bodyStart, baseIndent, endIdx);
                    const rangeArgs = pyForMatch[2].split(',').map(a => Number(resolveVar(a.trim())) || 0);
                    let rStart = 0, rEnd = 0, rStep = 1;
                    if (rangeArgs.length === 1) { rEnd = rangeArgs[0]; }
                    else if (rangeArgs.length === 2) { rStart = rangeArgs[0]; rEnd = rangeArgs[1]; }
                    else { rStart = rangeArgs[0]; rEnd = rangeArgs[1]; rStep = rangeArgs[2] || 1; }
                    for (let t = rStart; rStep > 0 ? t < rEnd : t > rEnd; t += rStep) {
                        variables[pyForMatch[1]] = t;
                        exec(bodyStart, bodyEnd);
                    }
                    i = bodyEnd;
                    continue;
                }

                // ---- RUST FOR RANGE: for x in 0..N { ----
                const rustForMatch = trimmed.match(/^for\s+(\w+)\s+in\s+(\d+)\.\.(\d+)\s*\{/);
                if (rustForMatch) {
                    const bodyStart = i + 1;
                    const bodyEnd = findClosingBrace(bodyStart, endIdx);
                    for (let t = Number(rustForMatch[2]); t < Number(rustForMatch[3]); t++) {
                        variables[rustForMatch[1]] = t;
                        exec(bodyStart, bodyEnd);
                    }
                    i = bodyEnd + 1;
                    continue;
                }

                // ---- IF / ELIF / ELSE IF ----
                const ifMatch = trimmed.match(/^(?:}\s*else\s+if|else\s+if|elif|if)\s*[\(]?(.+?)[\)]?\s*[:{]\s*$/);
                if (ifMatch && !trimmed.startsWith('if __name__')) {
                    let condStr = ifMatch[1].replace(/^\(+|\)+$/g, '').trim();
                    const condResult = evalCondition(condStr, false);
                    const currentIndent = raw.search(/\S/);
                    let ifBodyStart = i + 1, ifBodyEnd, elseIdx = -1;

                    if (trimmed.endsWith('{')) {
                        ifBodyEnd = findClosingBrace(ifBodyStart, endIdx);
                        // Look for else/else-if after closing brace
                        let nextIdx = ifBodyEnd + 1;
                        while (nextIdx < endIdx && lines[nextIdx] && lines[nextIdx].trim() === '') nextIdx++;
                        if (nextIdx < endIdx && lines[nextIdx]) {
                            const nextT = lines[nextIdx].trim();
                            if (/^(}\s*else|else)\b/.test(nextT)) {
                                elseIdx = nextIdx;
                            }
                        }
                    } else if (trimmed.endsWith(':')) {
                        ifBodyEnd = findPyBlockEnd(ifBodyStart, currentIndent, endIdx);
                        if (ifBodyEnd < endIdx && lines[ifBodyEnd]) {
                            const nextT = lines[ifBodyEnd].trim();
                            if (/^(elif|else)\b/.test(nextT)) {
                                elseIdx = ifBodyEnd;
                            }
                        }
                    } else { ifBodyEnd = ifBodyStart + 1; }

                    if (condResult) {
                        exec(ifBodyStart, ifBodyEnd);
                        // Skip all else/elif blocks
                        i = ifBodyEnd;
                        if (trimmed.endsWith('{')) i = ifBodyEnd + 1;
                        // Skip chained else/elif
                        while (i < endIdx && lines[i]) {
                            const sk = lines[i].trim();
                            if (/^(}\s*else\s+if|else\s+if|elif)\s/.test(sk)) {
                                if (sk.endsWith('{')) { i = findClosingBrace(i + 1, endIdx) + 1; }
                                else if (sk.endsWith(':')) { i = findPyBlockEnd(i + 1, lines[i].search(/\S/), endIdx); }
                                else i++;
                            } else if (/^(}\s*else|else)\s*[:{]?\s*$/.test(sk)) {
                                if (sk.includes('{')) { i = findClosingBrace(i + 1, endIdx) + 1; }
                                else if (sk.endsWith(':')) { i = findPyBlockEnd(i + 1, lines[i].search(/\S/), endIdx); }
                                else i++;
                                break;
                            } else break;
                        }
                    } else {
                        // Condition false: skip if body, look for else/elif
                        i = trimmed.endsWith('{') ? ifBodyEnd + 1 : ifBodyEnd;
                        if (elseIdx >= 0) {
                            i = elseIdx;
                            const elseT = lines[i].trim();
                            if (/^(}\s*else\s+if|else\s+if|elif)\s/.test(elseT)) {
                                // Next iteration will handle this elif/else-if
                                continue;
                            } else if (/^(}\s*else|else)\s*\{/.test(elseT)) {
                                const elseBodyStart = i + 1;
                                const elseBodyEnd = findClosingBrace(elseBodyStart, endIdx);
                                exec(elseBodyStart, elseBodyEnd);
                                i = elseBodyEnd + 1;
                            } else if (elseT === 'else:' || elseT === 'else') {
                                const elseBodyStart = i + 1;
                                if (elseT.endsWith(':')) {
                                    const elseBodyEnd = findPyBlockEnd(elseBodyStart, lines[i].search(/\S/), endIdx);
                                    exec(elseBodyStart, elseBodyEnd);
                                    i = elseBodyEnd;
                                } else {
                                    // else { on next line
                                    if (elseBodyStart < endIdx && lines[elseBodyStart] && lines[elseBodyStart].trim() === '{') {
                                        const elseBodyEnd = findClosingBrace(elseBodyStart + 1, endIdx);
                                        exec(elseBodyStart + 1, elseBodyEnd);
                                        i = elseBodyEnd + 1;
                                    } else { i++; }
                                }
                            } else { i++; }
                        }
                    }
                    continue;
                }

                // ---- STANDALONE ELSE (already handled above, skip block) ----
                if (/^(}\s*else|else)\s*[:{]?\s*$/.test(trimmed)) {
                    if (trimmed.includes('{')) { i = findClosingBrace(i + 1, endIdx) + 1; }
                    else if (trimmed.endsWith(':')) { i = findPyBlockEnd(i + 1, raw.search(/\S/), endIdx); }
                    else { i++; }
                    continue;
                }

                // ---- VARIABLE ASSIGNMENT ----
                const assignMatch = trimmed.match(/^(?:(?:int|string|var|let|const|String|float|double|i32|i64|bool|let\s+mut|static\s+\w+)\s+)?(\w+)\s*(?::=|=)\s*(.+?)(?:\s*;?\s*)$/);
                if (assignMatch && !/^(def |fn |func |class |public |static void|static string|static int|using |namespace |package |import |if |elif |for |while |else |return )/.test(trimmed) && !trimmed.match(/^let\s+\w+\s*=\s*\|\|/)) {
                    const varName = assignMatch[1];
                    let value = assignMatch[2].replace(/;$/, '').trim();

                    // Skip function-like assignments
                    if (value === '|| {' || value.startsWith('function') || value.startsWith('func')) { i++; continue; }

                    // String::from
                    const strFromMatch = value.match(/^String::from\("(.*)"\)/);
                    if (strFromMatch) { variables[varName] = strFromMatch[1]; i++; continue; }

                    // Input calls → keep default value
                    if (/^(?:input\s*\(|prompt\s*\(|new\s+java\.util\.Scanner|Console\.ReadLine|_input\.trim)/.test(value)) {
                        if (!variables.hasOwnProperty(varName)) variables[varName] = 0;
                        i++; continue;
                    }

                    // String split
                    const splitMatch = value.match(/^(\w+)\.split\("([^"]+)"\)/);
                    if (splitMatch) {
                        variables[varName] = String(variables[splitMatch[1]] || '').split(splitMatch[2]);
                        i++; continue;
                    }
                    // String Split (C#)
                    const csSplitMatch = value.match(/^(\w+)\.Split\("([^"]+)"\)/);
                    if (csSplitMatch) {
                        variables[varName] = String(variables[csSplitMatch[1]] || '').split(csSplitMatch[2]);
                        i++; continue;
                    }
                    // Rust collect split
                    if (value.match(/\.split\(".*"\)\.collect/)) {
                        const rSplit = value.match(/(\w+)\.split\("([^"]+)"\)/);
                        if (rSplit) { variables[varName] = String(variables[rSplit[1]] || '').split(rSplit[2]); }
                        i++; continue;
                    }

                    // Ternary for array access (UNSTRING results) - C-style
                    const ternaryArr = value.match(/(\w+)\.(?:length|Length|len\(\))\s*>\s*(\d+)\s*\?\s*(\w+)\[(\d+)\]\s*:\s*""/);
                    if (ternaryArr) {
                        const arr = variables[ternaryArr[1]] || variables[ternaryArr[3]];
                        if (Array.isArray(arr)) {
                            const idx = Number(ternaryArr[4]);
                            variables[varName] = idx < arr.length ? String(arr[idx]).trim() : '';
                        } else { variables[varName] = ''; }
                        i++; continue;
                    }
                    // Python ternary for array access: _parts[N] if len(_parts) > N else ""
                    const pyTernaryArr = value.match(/(\w+)\[(\d+)\]\s+if\s+len\((\w+)\)\s*>\s*(\d+)\s+else\s+""/);
                    if (pyTernaryArr) {
                        const arr = variables[pyTernaryArr[1]] || variables[pyTernaryArr[3]];
                        if (Array.isArray(arr)) {
                            const idx = Number(pyTernaryArr[2]);
                            variables[varName] = idx < arr.length ? String(arr[idx]).trim() : '';
                        } else { variables[varName] = ''; }
                        i++; continue;
                    }
                    // Rust if-let for array access
                    const rustIfArr = value.match(/if\s+(\w+)\.len\(\)\s*>\s*(\d+)\s*\{\s*(\w+)\[(\d+)\]\.to_string\(\)\s*\}\s*else\s*\{\s*String::new\(\)\s*\}/);
                    if (rustIfArr) {
                        const arr = variables[rustIfArr[1]] || variables[rustIfArr[3]];
                        if (Array.isArray(arr)) {
                            const idx = Number(rustIfArr[4]);
                            variables[varName] = idx < arr.length ? String(arr[idx]).trim() : '';
                        } else { variables[varName] = ''; }
                        i++; continue;
                    }

                    // String replace
                    const replMatch = value.match(/^(\w+)\.(?:replace|replaceAll|Replace|ReplaceAll)\s*\("([^"]+)",\s*"([^"]*)"\)/);
                    if (replMatch) {
                        variables[varName] = String(variables[replMatch[1]] || '').replace(new RegExp(replMatch[2].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replMatch[3]);
                        i++; continue;
                    }

                    // Rust vec![...].join("")
                    const joinMatch = value.match(/^vec!\[(.+)\]\.join\(""\)/);
                    if (joinMatch) {
                        const parts = joinMatch[1].split(',').map(p => {
                            p = p.trim();
                            if (p.startsWith('String::from("')) return p.slice(14, -2);
                            if (p.includes('.trim().to_string()')) return String(variables[p.replace('.trim().to_string()', '').trim()] || '').trim();
                            return String(resolveVar(p));
                        });
                        variables[varName] = parts.join('');
                        i++; continue;
                    }

                    // Go strings.Split
                    const goSplitMatch = value.match(/^strings\.Split\((\w+),\s*"([^"]+)"\)/);
                    if (goSplitMatch) {
                        variables[varName] = String(variables[goSplitMatch[1]] || '').split(goSplitMatch[2]);
                        i++; continue;
                    }
                    // Go strings.TrimSpace
                    value = value.replace(/strings\.TrimSpace\((\w+)\)/g, (m, vn) => {
                        return typeof variables[vn] === 'string' ? `"${variables[vn].trim()}"` : (variables[vn] !== undefined ? String(variables[vn]) : vn);
                    });
                    // Go strings.ReplaceAll
                    const goReplMatch = value.match(/^strings\.ReplaceAll\((\w+),\s*"([^"]+)",\s*"([^"]*)"\)/);
                    if (goReplMatch) {
                        variables[varName] = String(variables[goReplMatch[1]] || '').replace(new RegExp(goReplMatch[2].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), goReplMatch[3]);
                        i++; continue;
                    }

                    // Clean trim/type wrappers
                    value = value.replace(/\.trim\(\)(?:\.to_string\(\))?/g, '');
                    value = value.replace(/\.Trim\(\)/g, '');
                    value = value.replace(/\.strip\(\)/g, '');
                    value = value.replace(/^Math\.floor\((.+)\)$/, '$1');
                    value = value.replace(/^(?:int|Integer\.parseInt|parseInt)\s*\((.+)\)$/, '$1');
                    // Python str(var).strip() → resolve var value as string
                    value = value.replace(/str\((\w+)\)\.strip\(\)/g, (m, vn) => {
                        return variables.hasOwnProperty(vn) ? '"' + String(variables[vn]).trim() + '"' : '""';
                    });
                    value = value.replace(/str\((\w+)\)/g, (m, vn) => {
                        return variables.hasOwnProperty(vn) ? '"' + String(variables[vn]) + '"' : '""';
                    });
                    // Python var.strip() → resolve var value trimmed
                    value = value.replace(/(\w+)\.strip\(\)/g, (m, vn) => {
                        return variables.hasOwnProperty(vn) ? '"' + String(variables[vn]).trim() + '"' : vn;
                    });

                    const result = safeEval(value);
                    if (result !== null) variables[varName] = result;
                    else variables[varName] = resolveVar(value);
                    i++; continue;
                }

                // ---- Go if + short var: if len(_parts) > N { name = _parts[N] } ----
                const goIfAssign = trimmed.match(/^if\s+len\((\w+)\)\s*>\s*(\d+)\s*\{\s*(\w+)\s*=\s*(\w+)\[(\d+)\]\s*\}/);
                if (goIfAssign) {
                    const arr = variables[goIfAssign[1]] || variables[goIfAssign[4]];
                    const idx = Number(goIfAssign[5]);
                    if (Array.isArray(arr) && arr.length > idx) {
                        variables[goIfAssign[3]] = String(arr[idx]).trim();
                    }
                    i++; continue;
                }

                // ---- COMPOUND ASSIGNMENT ----
                const compoundMatch = trimmed.match(/^(\w+)\s*([\+\-\*\/])=\s*(.+?)(?:\s*;?\s*)$/);
                if (compoundMatch) {
                    const vn = compoundMatch[1], op = compoundMatch[2];
                    const val = Number(resolveVar(compoundMatch[3].replace(/;$/, '').trim())) || 0;
                    const curr = Number(variables[vn]) || 0;
                    switch (op) {
                        case '+': variables[vn] = curr + val; break;
                        case '-': variables[vn] = curr - val; break;
                        case '*': variables[vn] = curr * val; break;
                        case '/': variables[vn] = val !== 0 ? Math.floor(curr / val) : 0; break;
                    }
                    i++; continue;
                }

                // ---- PRINT STATEMENTS ----
                const printMatch = trimmed.match(
                    /^(?:print\s*\((.+)\)|System\.out\.println\s*\((.+)\)\s*;?|Console\.WriteLine\s*\((.+)\)\s*;?|fmt\.Println\s*\((.+)\)\s*|console\.log\s*\((.+)\)\s*;?|println!\s*\((.+)\)\s*;?)$/
                );
                if (printMatch) {
                    const content = printMatch[1] || printMatch[2] || printMatch[3] || printMatch[4] || printMatch[5] || printMatch[6];
                    if (content) {
                        let printContent = content;
                        const sprintMatch = printContent.match(/^fmt\.Sprint\((.+)\)$/);
                        if (sprintMatch) printContent = sprintMatch[1];
                        output.push(this._resolvePrint(printContent, variables));
                    }
                    i++; continue;
                }

                i++;
            }
        };

        exec(0, lines.length);
        return output;
    }

    /** Resolve print arguments */
    _resolvePrint(content, variables) {
        let c = content.replace(/,\s*sep\s*=\s*""\s*$/, '').trim();

        // Rust format: "text{}text" , var
        const rustFmt = c.match(/^"([^"]*)"(?:\s*,\s*(.+))?$/);
        if (rustFmt && rustFmt[1].includes('{}')) {
            let fmt = rustFmt[1];
            if (rustFmt[2]) {
                const args = rustFmt[2].split(',').map(a => a.trim());
                for (const arg of args) {
                    const val = variables.hasOwnProperty(arg) ? variables[arg] : arg;
                    fmt = fmt.replace('{}', val);
                }
            }
            return fmt;
        }

        // C# interpolated: $"text{var}"
        const csharpInterp = c.match(/^\$"([^"]*)"$/);
        if (csharpInterp) {
            let str = csharpInterp[1];
            str = str.replace(/\{([^}]+)\}/g, (m, vn) => variables.hasOwnProperty(vn) ? variables[vn] : vn);
            return str;
        }

        // Split by + and , (not inside quotes)
        const parts = [];
        let current = '', inStr = false, strChar = '', depth = 0;
        for (let i = 0; i < c.length; i++) {
            const ch = c[i];
            if (!inStr && (ch === '(' || ch === '[')) { depth++; current += ch; }
            else if (!inStr && (ch === ')' || ch === ']')) { depth--; current += ch; }
            else if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strChar = ch; current += ch; }
            else if (inStr && ch === strChar) { inStr = false; current += ch; }
            else if (!inStr && depth === 0 && (ch === '+' || ch === ',')) { parts.push(current.trim()); current = ''; }
            else { current += ch; }
        }
        if (current.trim()) parts.push(current.trim());

        return parts.map(p => {
            const cleaned = p.trim();
            if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'")))
                return cleaned.slice(1, -1);
            if (cleaned.startsWith('$"') || cleaned.startsWith('$@"')) {
                let str = cleaned.replace(/^\$@?"|"$/g, '');
                str = str.replace(/\{([^}]+)\}/g, (m, vn) => variables.hasOwnProperty(vn) ? variables[vn] : vn);
                return str;
            }
            if (cleaned.startsWith('f"') || cleaned.startsWith("f'")) {
                let str = cleaned.slice(2, -1);
                str = str.replace(/\{([^}]+)\}/g, (m, vn) => variables.hasOwnProperty(vn) ? variables[vn] : vn);
                return str;
            }
            if (variables.hasOwnProperty(cleaned)) return String(variables[cleaned]);
            if (!isNaN(cleaned) && cleaned !== '') return cleaned;
            // Try stripping trim
            const cleanerName = cleaned.replace(/\.trim\(\)|\.strip\(\)|\.Trim\(\)|\.to_string\(\)/g, '');
            if (variables.hasOwnProperty(cleanerName)) return String(variables[cleanerName]).trim();
            // Try str() wrapper
            const strWrapped = cleaned.match(/^str\((\w+)\)/);
            if (strWrapped && variables.hasOwnProperty(strWrapped[1])) return String(variables[strWrapped[1]]);
            return cleaned;
        }).join('');
    }

    // =====================================================================
    //  RUNNER UI
    // =====================================================================
    runCOBOL() {
        const cobolCode = document.getElementById('cobolInput').value.trim();
        if (!cobolCode) { this.showNotification('Please enter COBOL code first!', 'error'); return; }
        const resultEl = document.getElementById('cobolResult');
        const statusEl = document.getElementById('cobolStatus');
        statusEl.textContent = 'Running...'; statusEl.className = 'status running';
        setTimeout(() => {
            try {
                const lines = this.interpretCOBOL(cobolCode);
                if (lines.length > 0) {
                    resultEl.textContent = lines.join('\n');
                    resultEl.className = 'test-result success';
                    statusEl.textContent = 'Success'; statusEl.className = 'status success';
                    this.showNotification('COBOL executed successfully!', 'success');
                } else {
                    resultEl.textContent = '(No output)';
                    resultEl.className = 'test-result';
                    statusEl.textContent = 'Done'; statusEl.className = 'status success';
                }
            } catch (err) {
                resultEl.textContent = `Interpreter Error: ${err.message}`;
                resultEl.className = 'test-result error';
                statusEl.textContent = 'Error'; statusEl.className = 'status error';
            }
        }, 100);
    }

    runModern() {
        const outputEl = document.getElementById('output');
        const code = outputEl.textContent;
        if (!code || code === 'Click "Convert Code" to see the result...') {
            this.showNotification('Please convert COBOL code first!', 'error'); return;
        }
        const lang = document.getElementById('targetLang').value;
        const resultEl = document.getElementById('modernResult');
        const statusEl = document.getElementById('modernStatus');
        const langNames = { python: 'Python', java: 'Java', csharp: 'C#', javascript: 'JavaScript', go: 'Go', rust: 'Rust' };
        const langName = langNames[lang] || lang;
        const el = document.getElementById('modernLangName'); if (el) el.textContent = langName;
        statusEl.textContent = 'Running...'; statusEl.className = 'status running';
        setTimeout(() => {
            try {
                if (lang === 'javascript') {
                    const result = this.executeJavaScript(code);
                    resultEl.textContent = result.output;
                    resultEl.className = result.success ? 'test-result success' : 'test-result error';
                    statusEl.textContent = result.success ? 'Success' : 'Error';
                    statusEl.className = result.success ? 'status success' : 'status error';
                } else {
                    const modernLines = this.simulateModernExecution(code, lang);
                    resultEl.textContent = modernLines.length > 0 ? modernLines.join('\n') : '(No output detected)';
                    resultEl.className = modernLines.length > 0 ? 'test-result success' : 'test-result';
                    statusEl.textContent = modernLines.length > 0 ? 'Success' : 'Done';
                    statusEl.className = 'status success';
                }
                this.showNotification(`${langName} executed successfully!`, 'success');
            } catch (err) {
                resultEl.textContent = `Execution Error: ${err.message}`;
                resultEl.className = 'test-result error';
                statusEl.textContent = 'Error'; statusEl.className = 'status error';
            }
        }, 100);
    }

    runBothAndCompare() {
        const cobolCode = document.getElementById('cobolInput').value.trim();
        const convertedCode = document.getElementById('output').textContent;
        if (!cobolCode) { this.showNotification('Please enter COBOL code first!', 'error'); return; }
        if (!convertedCode || convertedCode === 'Click "Convert Code" to see the result...') {
            this.showNotification('Please convert the code first!', 'error'); return;
        }
        this.runCOBOL();
        const lang = document.getElementById('targetLang').value;
        const resultEl = document.getElementById('modernResult');
        const statusEl = document.getElementById('modernStatus');
        const langNames = { python: 'Python', java: 'Java', csharp: 'C#', javascript: 'JavaScript', go: 'Go', rust: 'Rust' };
        const langName = langNames[lang] || lang;
        const el = document.getElementById('modernLangName'); if (el) el.textContent = langName;
        statusEl.textContent = 'Running...'; statusEl.className = 'status running';

        setTimeout(() => {
            try {
                let modernLines;
                if (lang === 'javascript') {
                    const result = this.executeJavaScript(convertedCode);
                    modernLines = result.success ? result.output.split('\n') : [`Error: ${result.output}`];
                } else {
                    modernLines = this.simulateModernExecution(convertedCode, lang);
                }
                resultEl.textContent = modernLines.length > 0 ? modernLines.join('\n') : '(No output detected)';
                resultEl.className = modernLines.length > 0 ? 'test-result success' : 'test-result';
                statusEl.textContent = modernLines.length > 0 ? 'Success' : 'Done';
                statusEl.className = 'status success';

                setTimeout(() => {
                    const cobolOutput = document.getElementById('cobolResult').textContent.trim();
                    const modernOutput = resultEl.textContent.trim();
                    const compBar = document.getElementById('comparisonResult');
                    const compText = document.getElementById('comparisonText');
                    if (!cobolOutput || cobolOutput.startsWith('(') || !modernOutput || modernOutput.startsWith('(')) { compBar.style.display = 'none'; return; }
                    compBar.style.display = 'flex';
                    const cLines = cobolOutput.split('\n').map(l => l.trim()).filter(l => l);
                    const mLines = modernOutput.split('\n').map(l => l.trim()).filter(l => l);
                    const maxLen = Math.max(cLines.length, mLines.length);
                    let matches = 0;
                    for (let i = 0; i < maxLen; i++) { if (cLines[i] === mLines[i]) matches++; }
                    const pct = maxLen > 0 ? Math.round((matches / maxLen) * 100) : 0;
                    if (pct === 100) { compBar.className = 'comparison-bar match'; compText.textContent = `\u2705 Perfect Match! Both outputs are identical (${matches}/${maxLen} lines match)`; }
                    else if (pct >= 60) { compBar.className = 'comparison-bar partial'; compText.textContent = `\u26A0\uFE0F Partial Match: ${pct}% similar (${matches}/${maxLen} lines match)`; }
                    else { compBar.className = 'comparison-bar mismatch'; compText.textContent = `\u274C Outputs differ: ${pct}% match (${matches}/${maxLen} lines)`; }
                }, 200);
            } catch (err) {
                resultEl.textContent = `Execution Error: ${err.message}`;
                resultEl.className = 'test-result error';
                statusEl.textContent = 'Error'; statusEl.className = 'status error';
            }
        }, 200);
    }

    clearRunOutput() {
        const langNames = { python: 'Python', java: 'Java', csharp: 'C#', javascript: 'JavaScript', go: 'Go', rust: 'Rust' };
        const lang = document.getElementById('targetLang').value;
        const langName = langNames[lang] || 'Python';
        document.getElementById('cobolResult').textContent = 'Click "Run COBOL" to execute your COBOL code...';
        document.getElementById('cobolResult').className = 'test-result';
        document.getElementById('cobolStatus').textContent = 'Ready'; document.getElementById('cobolStatus').className = 'status';
        document.getElementById('modernResult').textContent = `Click "Run ${langName}" to execute converted code...`;
        document.getElementById('modernResult').className = 'test-result';
        document.getElementById('modernStatus').textContent = 'Ready'; document.getElementById('modernStatus').className = 'status';
        document.getElementById('comparisonResult').style.display = 'none';
        this.showNotification('Output cleared', 'info');
    }

    // =====================================================================
    //  UI HELPERS
    // =====================================================================
    displayResult(code) { const o = document.getElementById('output'); if (o) o.textContent = code; }
    clear() { document.getElementById('cobolInput').value = ''; document.getElementById('output').textContent = 'Click "Convert Code" to see the result...'; this.showNotification('Cleared', 'info'); }
    copy() {
        const t = document.getElementById('output').textContent;
        if (t === 'Click "Convert Code" to see the result...') { this.showNotification('No code to copy', 'error'); return; }
        navigator.clipboard.writeText(t).then(() => this.showNotification('Copied!', 'success')).catch(() => this.showNotification('Failed to copy', 'error'));
    }
    download() {
        const t = document.getElementById('output').textContent;
        if (t === 'Click "Convert Code" to see the result...') { this.showNotification('No code to download', 'error'); return; }
        const exts = { python: '.py', java: '.java', csharp: '.cs', javascript: '.js', go: '.go', rust: '.rs' };
        const fn = `converted_code${exts[this.currentLanguage] || '.txt'}`;
        const blob = new Blob([t], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = fn;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        this.showNotification(`Downloaded as ${fn}`, 'success');
    }
    loadExample(key) { if (this.examples[key]) { document.getElementById('cobolInput').value = this.examples[key]; this.showNotification(`Loaded ${key} example`, 'info'); } }
    loadRandomExample() { const k = Object.keys(this.examples); this.loadExample(k[Math.floor(Math.random() * k.length)]); }
    showLoading(show) { document.getElementById('loading').style.display = show ? 'flex' : 'none'; }
    showNotification(message, type = 'info') {
        const n = document.getElementById('notification');
        n.querySelector('.notification-text').textContent = message;
        n.className = `notification ${type}`; n.style.display = 'flex';
        setTimeout(() => this.hideNotification(), 3000);
    }
    hideNotification() { document.getElementById('notification').style.display = 'none'; }
}

// Initialize
let converter;
document.addEventListener('DOMContentLoaded', () => { converter = new COBOLConverter(); });
