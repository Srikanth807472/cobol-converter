// COBOL to Modern Language Converter — Unified AST Approach
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

    /** Parse DATA DIVISION variables */
    parseVariables(code) {
        const vars = [];
        const re = /(?:01|05|10|15|77|88)\s+([A-Z0-9\-_]+)\s+PIC\s+([^\s.]+)(?:\s+VALUE\s+["']?([^"'\s.]+)["']?)?/gi;
        let m;
        while ((m = re.exec(code)) !== null) {
            const pic = m[2].toUpperCase();
            const isStr = pic.includes('X');
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
                if (u === 'STOP RUN') continue;
                // Skip END PROGRAM
                if (u.startsWith('END PROGRAM')) continue;
                // Skip paragraph labels (single word ending in period, or word followed by period on original line)
                if (/^[A-Z][A-Z0-9\-_]*$/i.test(u) && line.trim().endsWith('.')) continue;
                // Strip WITH NO ADVANCING from DISPLAY
                cleaned = cleaned.replace(/\s+WITH\s+NO\s+ADVANCING\s*$/i, '');
                procLines.push(cleaned);
            }
        }
        return this._parseBlock(procLines, 0).stmts;
    }

    /** Recursive block parser. Returns {stmts, nextIndex}. */
    _parseBlock(lines, start) {
        const stmts = [];
        let i = start;
        while (i < lines.length) {
            const line = lines[i];
            const upper = line.toUpperCase();

            // End markers
            if (upper.startsWith('END-PERFORM') || upper.startsWith('END-IF') || upper === 'ELSE') {
                return { stmts, nextIndex: i };
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

            // IF / ELSE / END-IF
            if (upper.startsWith('IF ')) {
                // Use original line to preserve quoted string case
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

    /** Parse DISPLAY argument into parts: [{type:'string',value}, {type:'var',name}] */
    _parseDisplayParts(raw) {
        const parts = [];
        // Split on commas first, then tokenize each segment
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
    convertExpr(expr) {
        return expr.replace(/[A-Z][A-Z0-9\-_]*/gi, m => isNaN(m) ? this.cv(m) : m);
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
        // Preserve quoted strings exactly, only convert unquoted identifiers
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
    //  All C-family converters share this to avoid repetition
    // =====================================================================
    _genArith(s, ind, semi) {
        const sc = semi ? ';' : '';
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
                r += `${ind}${this.cv(s.target)} = ${a} / ${b}${sc}\n`;
                if (s.remainder) r += `${ind}${this.cv(s.remainder)} = ${a} % ${b}${sc}\n`;
                break;
            }
            case 'DIVIDE_INTO': {
                const d = isNaN(s.divisor) ? this.cv(s.divisor) : s.divisor; const tn = this.cv(s.target);
                r += `${ind}${tn} = ${tn} / ${d}${sc}\n`;
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
        let r = '';
        if (cmt) r += '# Converted from COBOL to Python\n# Generated by COBOL Converter\n\n';
        r += 'def main():\n';
        if (vars.length) {
            if (cmt) r += '    # Variable declarations\n';
            for (const v of vars) {
                const n = this.cv(v.name);
                r += v.type === 'string' ? `    ${n} = "${v.value}"\n` : `    ${n} = ${v.value}\n`;
            }
            r += '\n';
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
                        // If not a known variable, treat as string literal
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
                case 'COMPUTE': r += `${ind}${this.cv(s.variable)} = ${this.convertExpr(s.expression)}\n`; break;
                case 'ADD': case 'ADD_GIVING': case 'SUBTRACT': case 'SUBTRACT_GIVING':
                case 'MULTIPLY': case 'MULTIPLY_GIVING': case 'DIVIDE_GIVING': case 'DIVIDE_INTO':
                    r += this._genArith(s, ind, false);
                    break;
                case 'PERFORM_VARYING': {
                    const c = this.cv(s.counter);
                    r += `${ind}${c} = ${isNaN(s.from) ? this.cv(s.from) : s.from}\n`;
                    r += `${ind}while ${c} <= ${isNaN(s.limitVal) ? this.cv(s.limitVal) : s.limitVal}:\n`;
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
            }
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
        let r = '';
        if (cmt) r += '// Converted from COBOL to Java\n// Generated by COBOL Converter\n\n';
        r += 'public class COBOLProgram {\n    public static void main(String[] args) {\n';
        if (vars.length) {
            if (cmt) r += '        // Variable declarations\n';
            for (const v of vars) {
                const n = this.cv(v.name);
                r += v.type === 'string' ? `        String ${n} = "${v.value}";\n` : `        int ${n} = ${v.value};\n`;
            }
            r += '\n';
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
        let r = '';
        if (cmt) r += '// Converted from COBOL to C#\n// Generated by COBOL Converter\n\n';
        r += 'using System;\n\nnamespace COBOLProgram\n{\n    class Program\n    {\n        static void Main(string[] args)\n        {\n';
        if (vars.length) {
            if (cmt) r += '            // Variable declarations\n';
            for (const v of vars) {
                const n = this.cv(v.name);
                r += v.type === 'string' ? `            string ${n} = "${v.value}";\n` : `            int ${n} = ${v.value};\n`;
            }
            r += '\n';
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
        let r = '';
        if (cmt) r += '// Converted from COBOL to JavaScript\n// Generated by COBOL Converter\n\n';
        r += 'function main() {\n';
        if (vars.length) {
            if (cmt) r += '    // Variable declarations\n';
            for (const v of vars) {
                const n = this.cv(v.name);
                r += v.type === 'string' ? `    let ${n} = "${v.value}";\n` : `    let ${n} = ${v.value};\n`;
            }
            r += '\n';
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
        let r = '';
        if (cmt) r += '// Converted from COBOL to Go\n// Generated by COBOL Converter\n\n';
        r += 'package main\n\nimport "fmt"\n\nfunc main() {\n';
        if (vars.length) {
            if (cmt) r += '    // Variable declarations\n';
            for (const v of vars) {
                const n = this.cv(v.name);
                if (v.value !== '' && v.value !== 0) {
                    r += v.type === 'string' ? `    ${n} := "${v.value}"\n` : `    ${n} := ${v.value}\n`;
                } else {
                    r += v.type === 'string' ? `    var ${n} string = ""\n` : `    var ${n} int = 0\n`;
                }
            }
            r += '\n';
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
        let r = '';
        if (cmt) r += '// Converted from COBOL to Rust\n// Generated by COBOL Converter\n\n';
        r += 'fn main() {\n';
        if (vars.length) {
            if (cmt) r += '    // Variable declarations\n';
            for (const v of vars) {
                const n = this.cv(v.name);
                r += v.type === 'string'
                    ? `    let mut ${n} = String::from("${v.value}");\n`
                    : `    let mut ${n}: i64 = ${v.value};\n`;
            }
            r += '\n';
        }
        r += this._cBlock(stmts, '    ', 'rust');
        r += '}\n';
        return r;
    }

    // =====================================================================
    //  UNIFIED C-FAMILY BLOCK GENERATOR
    //  Used by Java, C#, JavaScript, Go, Rust
    // =====================================================================
    _cBlock(stmts, ind, lang) {
        const semi = lang !== 'go';  // Go doesn't use semicolons
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
                    r += `${ind}${this.cv(s.variable)} = ${this.convertExpr(s.expression)}${sc}\n`;
                    break;
                case 'ADD': case 'ADD_GIVING': case 'SUBTRACT': case 'SUBTRACT_GIVING':
                case 'MULTIPLY': case 'MULTIPLY_GIVING': case 'DIVIDE_GIVING': case 'DIVIDE_INTO':
                    r += this._genArith(s, ind, semi);
                    break;
                case 'PERFORM_VARYING': {
                    const c = this.cv(s.counter);
                    const from = isNaN(s.from) ? this.cv(s.from) : s.from;
                    const lim = isNaN(s.limitVal) ? this.cv(s.limitVal) : s.limitVal;
                    const by = isNaN(s.by) ? this.cv(s.by) : s.by;
                    if (lang === 'rust') {
                        r += `${ind}${c} = ${from};\n`;
                        r += `${ind}while ${c} <= ${lim} {\n`;
                        r += this._cBlock(s.body, ind + '    ', lang);
                        r += `${ind}    ${c} += ${by};\n`;
                        r += `${ind}}\n`;
                    } else if (lang === 'go') {
                        r += `${ind}for ${c} = ${from}; ${c} <= ${lim}; ${c} += ${by} {\n`;
                        r += this._cBlock(s.body, ind + '    ', lang);
                        r += `${ind}}\n`;
                    } else {
                        r += `${ind}for (${c} = ${from}; ${c} <= ${lim}; ${c} += ${by}) {\n`;
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
            }
        }
        return r;
    }

    /** Generate the appropriate print statement for the language */
    _langPrint(parts, lang) {
        const resolvePart = (p) => {
            if (p.type === 'string') return { isStr: true, val: p.value };
            // If not a known variable, treat as string literal
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
        for (const v of varDefs) variables[v.name] = v.value;
        const stmts = this.parseStatements(code);

        const resolve = (token) => {
            if (!token) return '';
            const t = token.trim().replace(/^["']|["']$/g, '');
            const upper = t.toUpperCase();
            // Resolve COBOL figurative constants
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
            // Handle quoted string comparisons like: OPERATOR = "+"
            const eqStr = condStr.match(/([A-Z0-9\-_]+)\s*=\s*["']([^"']*)["']/i);
            if (eqStr) return String(resolve(eqStr[1])) === eqStr[2];
            const geM = condStr.match(/([A-Z0-9\-_]+)\s*>=\s*(["']?[^\s"']+["']?)/i);
            const leM = condStr.match(/([A-Z0-9\-_]+)\s*<=\s*(["']?[^\s"']+["']?)/i);
            const gtM = condStr.match(/([A-Z0-9\-_]+)\s*>\s*(["']?[^\s"']+["']?)/i);
            const ltM = condStr.match(/([A-Z0-9\-_]+)\s*<\s*(["']?[^\s"']+["']?)/i);
            const eqM = condStr.match(/([A-Z0-9\-_]+)\s*=\s*(["']?[^\s"']+["']?)/i);
            if (geM) return Number(resolve(geM[1])) >= Number(resolve(geM[2]));
            if (leM) return Number(resolve(leM[1])) <= Number(resolve(leM[2]));
            if (gtM) return Number(resolve(gtM[1])) > Number(resolve(gtM[2]));
            if (ltM) return Number(resolve(ltM[1])) < Number(resolve(ltM[2]));
            if (eqM) return String(resolve(eqM[1])) === String(resolve(eqM[2]));
            return false;
        };

        const execute = (stmtList) => {
            for (const s of stmtList) {
                switch (s.type) {
                    case 'ACCEPT': {
                        // In browser interpreter, simulate input with default values
                        const target = s.variable.toUpperCase();
                        if (variables.hasOwnProperty(target)) {
                            // Keep current value (simulates user not changing default)
                        } else {
                            variables[target] = 0;
                        }
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
                        let safety = 0;
                        while (variables[counter] <= limit && safety < 10000) {
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
            const wrappedCode = code.replace(/console\.log/g, '__log').replace(/console\.error/g, '__log').replace(/console\.warn/g, '__log');
            const fn = new Function('__log', wrappedCode);
            fn(sandboxLog);
            return { success: true, output: output.join('\n') || '(No output)' };
        } catch (error) {
            return { success: false, output: `Runtime Error: ${error.message}` };
        }
    }

    // =====================================================================
    //  TRACE-BASED SIMULATOR for non-JS languages
    // =====================================================================
    simulateModernExecution(code, language) {
        const output = [];
        const lines = code.split('\n');
        const variables = {};

        const resolveVar = (v) => {
            const clean = v.trim();
            if (variables.hasOwnProperty(clean)) return variables[clean];
            if (clean.startsWith('"') || clean.startsWith("'")) return clean.replace(/^["']|["']$/g, '');
            if (!isNaN(clean)) return Number(clean);
            return clean;
        };

        const safeEval = (expr) => {
            try {
                let e = expr;
                // Sort by name length descending to avoid partial replacements
                const sorted = Object.entries(variables).sort((a, b) => b[0].length - a[0].length);
                for (const [vn, vv] of sorted) {
                    const re = new RegExp(`\\b${vn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                    e = e.replace(re, typeof vv === 'number' ? vv : `"${vv}"`);
                }
                const sanitized = e.replace(/[^0-9+\-*/().%\s]/g, '');
                if (sanitized.trim()) return Function(`"use strict"; return (${sanitized})`)();
            } catch {}
            return null;
        };

        const exec = (startIdx, endIdx) => {
            let i = startIdx;
            while (i < endIdx) {
                const trimmed = lines[i].trim();
                if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed === '{' || trimmed === '}') { i++; continue; }
                if (/^(def |fn |func |class |public |static |using |namespace |package |import |if __name__|main\(\)|let converter)/.test(trimmed)) { i++; continue; }
                // Skip input/scan/readline statements (Go fmt.Scanln, Rust stdin, etc.)
                if (/^(fmt\.Scanln|std::io::stdin|let\s+mut\s+_input)/.test(trimmed)) { i++; continue; }

                // ---- FOR LOOP (C-style) ----
                const forMatch = trimmed.match(/^for\s*\(?(?:let\s+|int\s+|var\s+)?(\w+)\s*[:=]+\s*(\S+)\s*;\s*\1\s*(<=|<)\s*(\S+)\s*;\s*\1\s*(?:\+\+|\+=\s*(\S+))/);
                if (forMatch) {
                    const varName = forMatch[1];
                    const from = Number(resolveVar(forMatch[2])) || 0;
                    const op = forMatch[3]; // '<' or '<='
                    const limit = Number(resolveVar(forMatch[4])) || 0;
                    const step = forMatch[5] ? (Number(resolveVar(forMatch[5])) || 1) : 1; // ++ means step=1
                    const bodyStart = i + 1;
                    let depth = 1, bodyEnd = bodyStart;
                    while (bodyEnd < endIdx && depth > 0) {
                        const l = lines[bodyEnd].trim();
                        if (l.includes('{') && !l.startsWith('//') && !l.startsWith('#')) depth++;
                        if ((l === '}' || l.startsWith('}')) && !l.startsWith('//')) depth--;
                        if (depth > 0) bodyEnd++; else break;
                    }
                    variables[varName] = from;
                    let safety = 0;
                    const cmp = op === '<' ? () => variables[varName] < limit : () => variables[varName] <= limit;
                    while (cmp() && safety < 10000) {
                        exec(bodyStart, bodyEnd);
                        variables[varName] = Number(variables[varName]) + step;
                        safety++;
                    }
                    i = bodyEnd + 1;
                    continue;
                }

                // ---- WHILE LOOP (Rust / Python) ----
                const whileMatch = trimmed.match(/^while\s+(\w+)\s*<=\s*(\S+)\s*[:{]?\s*$/);
                if (whileMatch) {
                    const varName = whileMatch[1];
                    const limit = Number(resolveVar(whileMatch[2])) || 0;
                    const bodyStart = i + 1;
                    // Find end of block
                    let bodyEnd;
                    if (trimmed.endsWith('{')) {
                        let depth = 1; bodyEnd = bodyStart;
                        while (bodyEnd < endIdx && depth > 0) {
                            const l = lines[bodyEnd].trim();
                            if (l.includes('{') && !l.startsWith('//')) depth++;
                            if ((l === '}' || l.startsWith('}')) && !l.startsWith('//')) depth--;
                            if (depth > 0) bodyEnd++; else break;
                        }
                    } else {
                        // Python indentation-based
                        const whileIndent = lines[i].search(/\S/);
                        bodyEnd = bodyStart;
                        while (bodyEnd < endIdx) {
                            const nextLine = lines[bodyEnd];
                            const nextIndent = nextLine.search(/\S/);
                            if (nextLine.trim() === '' || nextIndent > whileIndent) bodyEnd++;
                            else break;
                        }
                    }
                    let safety = 0;
                    while (Number(variables[varName] || 0) <= limit && safety < 10000) {
                        exec(bodyStart, bodyEnd);
                        safety++;
                    }
                    i = (trimmed.endsWith('{')) ? bodyEnd + 1 : bodyEnd;
                    continue;
                }

                // ---- PYTHON FOR RANGE ----
                const pyForMatch = trimmed.match(/^for\s+(\w+)\s+in\s+range\((\d+)\)\s*:/);
                if (pyForMatch) {
                    const whileIndent = lines[i].search(/\S/);
                    const bodyStart = i + 1;
                    let bodyEnd = bodyStart;
                    while (bodyEnd < endIdx) {
                        const nextLine = lines[bodyEnd];
                        const nextIndent = nextLine.search(/\S/);
                        if (nextLine.trim() === '' || nextIndent > whileIndent) bodyEnd++;
                        else break;
                    }
                    for (let t = 0; t < Number(pyForMatch[2]); t++) {
                        variables[pyForMatch[1]] = t;
                        exec(bodyStart, bodyEnd);
                    }
                    i = bodyEnd;
                    continue;
                }

                // ---- RUST FOR RANGE ----
                const rustForMatch = trimmed.match(/^for\s+(\w+)\s+in\s+0\.\.(\d+)\s*\{/);
                if (rustForMatch) {
                    const bodyStart = i + 1;
                    let depth = 1, bodyEnd = bodyStart;
                    while (bodyEnd < endIdx && depth > 0) {
                        const l = lines[bodyEnd].trim();
                        if (l.includes('{')) depth++;
                        if (l === '}' || l.startsWith('}')) depth--;
                        if (depth > 0) bodyEnd++; else break;
                    }
                    for (let t = 0; t < Number(rustForMatch[2]); t++) {
                        variables[rustForMatch[1]] = t;
                        exec(bodyStart, bodyEnd);
                    }
                    i = bodyEnd + 1;
                    continue;
                }

                // ---- IF BLOCK ----
                const ifMatch = trimmed.match(/^if\s*[\(]?(.+?)[\)]?\s*[:{]\s*$/);
                if (ifMatch && !trimmed.startsWith('if __name__')) {
                    let condStr = ifMatch[1].replace(/^\(|\)$/g, '').trim();
                    let condResult = false;
                    try {
                        let evalCond = condStr;
                        const sorted = Object.entries(variables).sort((a, b) => b[0].length - a[0].length);
                        for (const [vn, vv] of sorted) {
                            const re = new RegExp(`\\b${vn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                            evalCond = evalCond.replace(re, typeof vv === 'number' ? vv : `"${vv}"`);
                        }
                        condResult = Function(`"use strict"; return (${evalCond})`)();
                    } catch { condResult = false; }

                    const currentIndent = lines[i].search(/\S/);
                    let ifBodyStart = i + 1, ifBodyEnd, elseBodyStart = -1, elseBodyEnd = -1;

                    if (trimmed.endsWith('{')) {
                        let depth = 1; ifBodyEnd = ifBodyStart;
                        while (ifBodyEnd < endIdx && depth > 0) {
                            const l = lines[ifBodyEnd].trim();
                            if (l.includes('{') && !l.startsWith('//')) depth++;
                            if ((l === '}' || l.startsWith('}')) && !l.startsWith('//')) depth--;
                            if (depth > 0) ifBodyEnd++; else break;
                        }
                        // Check for else
                        let checkIdx = ifBodyEnd;
                        if (checkIdx < endIdx && lines[checkIdx].trim() === '}') checkIdx++;
                        if (checkIdx < endIdx && /^(}\s*else|else)\s*\{?\s*$/.test(lines[checkIdx].trim())) {
                            elseBodyStart = checkIdx + 1;
                            let d2 = 1; elseBodyEnd = elseBodyStart;
                            while (elseBodyEnd < endIdx && d2 > 0) {
                                const l2 = lines[elseBodyEnd].trim();
                                if (l2.includes('{') && !l2.startsWith('//')) d2++;
                                if ((l2 === '}' || l2.startsWith('}')) && !l2.startsWith('//')) d2--;
                                if (d2 > 0) elseBodyEnd++; else break;
                            }
                        }
                    } else {
                        // Python-style
                        ifBodyEnd = ifBodyStart;
                        while (ifBodyEnd < endIdx) {
                            const nextIndent = lines[ifBodyEnd].search(/\S/);
                            if (lines[ifBodyEnd].trim() === '' || nextIndent > currentIndent) ifBodyEnd++;
                            else break;
                        }
                        if (ifBodyEnd < endIdx && lines[ifBodyEnd].trim().startsWith('else')) {
                            elseBodyStart = ifBodyEnd + 1;
                            elseBodyEnd = elseBodyStart;
                            while (elseBodyEnd < endIdx) {
                                const nextIndent = lines[elseBodyEnd].search(/\S/);
                                if (lines[elseBodyEnd].trim() === '' || nextIndent > currentIndent) elseBodyEnd++;
                                else break;
                            }
                        }
                    }

                    if (condResult) exec(ifBodyStart, ifBodyEnd);
                    else if (elseBodyStart >= 0) exec(elseBodyStart, elseBodyEnd);

                    if (elseBodyEnd >= 0) i = elseBodyEnd + 1;
                    else if (ifBodyEnd >= 0) i = ifBodyEnd + 1;
                    else i++;
                    continue;
                }

                // ---- VARIABLE ASSIGNMENT ----
                const assignMatch = trimmed.match(/^(?:(?:int|string|var|let|const|String|float|double|i32|i64|bool|let\s+mut)\s+)?(\w+)\s*(?::=|=)\s*(.+?)(?:\s*;?\s*)$/);
                if (assignMatch && !/^(def |fn |func |class |public |static |using |namespace |package |import |if |for |while )/.test(trimmed)) {
                    const varName = assignMatch[1];
                    let value = assignMatch[2].replace(/;$/, '').trim();
                    const strFromMatch = value.match(/^String::from\("(.*)"\)/);
                    if (strFromMatch) { variables[varName] = strFromMatch[1]; i++; continue; }
                    // Handle input/prompt/readline calls — simulate with default value
                    if (/^(?:input\s*\(|prompt\s*\(|new\s+java\.util\.Scanner|Console\.ReadLine|_input\.trim)/.test(value)) {
                        // Keep existing value if set, otherwise default to 0
                        if (!variables.hasOwnProperty(varName)) variables[varName] = 0;
                        i++; continue;
                    }
                    value = value.replace(/^Math\.floor\((.+)\)$/, '$1');
                    // Handle int() / Integer.parseInt() wrappers
                    value = value.replace(/^(?:int|Integer\.parseInt|parseInt)\s*\((.+)\)$/, '$1');
                    const result = safeEval(value);
                    if (result !== null) variables[varName] = result;
                    else variables[varName] = resolveVar(value);
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
                        // Handle fmt.Sprint wrapper for Go
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

        // Split by + and , (not inside quotes)
        const parts = [];
        let current = '', inStr = false, strChar = '';
        for (let i = 0; i < c.length; i++) {
            const ch = c[i];
            if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strChar = ch; current += ch; }
            else if (inStr && ch === strChar) { inStr = false; current += ch; }
            else if (!inStr && (ch === '+' || ch === ',')) { parts.push(current.trim()); current = ''; }
            else { current += ch; }
        }
        if (current.trim()) parts.push(current.trim());

        return parts.map(p => {
            const cleaned = p.trim();
            if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) return cleaned.slice(1, -1);
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
            if (!isNaN(cleaned)) return cleaned;
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
                    if (pct === 100) { compBar.className = 'comparison-bar match'; compText.textContent = `✅ Perfect Match! Both outputs are identical (${matches}/${maxLen} lines match)`; }
                    else if (pct >= 60) { compBar.className = 'comparison-bar partial'; compText.textContent = `⚠️ Partial Match: ${pct}% similar (${matches}/${maxLen} lines match)`; }
                    else { compBar.className = 'comparison-bar mismatch'; compText.textContent = `❌ Outputs differ: ${pct}% match (${matches}/${maxLen} lines)`; }
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
