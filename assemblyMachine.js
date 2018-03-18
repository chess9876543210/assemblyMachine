

function alu() {
    
    this.programPointer = 0;
    this.accu = 0;
    this.flagN = false;
    this.flagV = false;
    this.flagZ = false;
    
    this.memorySize = 256;
    this.memory = new Int32Array(this.memorySize);
    
    this.reset = function() {
        this.programPointer = 0;
        this.accu = 0;
        this.flagN = false;
        this.flagV = false;
        this.flagZ = false;
        for (i=0; i<this.memorySize; i++) {
            this.memory[i] = 0;
        }
    }
    
    this.getProgramPointer = function() {
        return this.programPointer;
    }
    
    this.setFlags = function(value) {
        this.flagN = value < 0;
        this.flagZ = value == 0;
    }
    
    this.handleOverflow = function(value) {
        var valueInt32 = value >> 0; // converts to int32
        this.flagV = (value != valueInt32);
        return valueInt32;
    }
    
    this.setAccu = function(value) {
        this.accu = value;
        this.setFlags(value);
    }
    
    this.setAccuWithOverflow = function(value) {
        this.setAccu(this.handleOverflow(value));
    }
    
    this.getMemory = function(addr) {
        return this.memory[addr];
    }
    
    this.setMemory = function(addr, value) {
        this.memory[addr] = value;
    }
    
    this.getNFlag = function() { return this.flagN; }
    this.getVFlag = function() { return this.flagV; }
    this.getZFlag = function() { return this.flagZ; }
    this.getAccu = function() { return this.accu; }
    
    
    this.LoadI = function(value) {
        this.setAccu(value);
        this.programPointer++;
    }
    this.Load = function(addr) {
        this.LoadI(this.getMemory(addr));
    }
    this.Store = function(addr) {
        this.setMemory(addr, this.accu);
        this.programPointer++;
    }
    this.AddI = function(value) {
        this.setAccuWithOverflow(this.accu + value);
        this.programPointer++;
    }
    this.Add = function(addr) {
        this.AddI(this.getMemory(addr));
    }
    this.CmpI = function(value) {
        this.setFlags(this.accu - value);
        this.programPointer++;
    }
    this.Cmp = function(addr) {
        this.CmpI(this.getMemory(addr));
    }
    this.MulI = function(value) {
        this.setAccuWithOverflow(this.accu * value);
        this.programPointer++;
    }
    this.Mul = function(addr) {
        this.MulI(this.getMemory(addr));
    }
    this.DivI = function(value) {
        this.setAccuWithOverflow(Math.floor(this.accu/value));
        this.programPointer++;
    }
    this.Div = function(addr) {
        this.DivI(this.getMemory(addr));
    }
    this.SubI = function(value) {
        this.setAccuWithOverflow(this.accu - value);
        this.programPointer++;
    }
    this.Sub = function(addr) {
        this.SubI(this.getMemory(addr));
    }
    this.ModI = function(value) {
        this.setAccuWithOverflow(this.accu%value)
        this.programPointer++;
    }
    this.Mod = function(addr) {
        this.ModI(this.getMemory(addr));
    }
    this.AndI = function(value) {
        this.setAccuWithOverflow(this.accu&value)
        this.programPointer++;
    }
    this.And = function(addr) {
        this.AndI(this.getMemory(addr));
    }
    this.OrI = function(value) {
        this.setAccuWithOverflow(this.accu|value)
        this.programPointer++;
    }
    this.Or = function(addr) {
        this.OrI(this.getMemory(addr));
    }
    this.XorI = function(value) {
        this.setAccuWithOverflow(this.accu^value)
        this.programPointer++;
    }
    this.Xor = function(addr) {
        this.XorI(this.getMemory(addr));
    }
    this.ShlI = function(value) {
        this.setAccuWithOverflow(this.accu<<value)
        this.programPointer++;
    }
    this.Shl = function(addr) {
        this.ShlI(this.getMemory(addr));
    }
    this.ShrI = function(value) {
        this.setAccuWithOverflow(this.accu>>value)
        this.programPointer++;
    }
    this.Shr = function(addr) {
        this.ShrI(this.getMemory(addr));
    }
    this.ShraI = function(value) {
        var tmpaccu = this.accu;
        var isPositive = tmpaccu >= 0;
        for (var i = 0; i < value; i ++) {
            // todo: test
            tmpaccu >> 1;
            if (!isPositive)
                tmpaccu |= (1 << 32);
        }
        this.setAccuWithOverflow(tmpaccu)
        this.programPointer++;
    }
    this.Shra = function(addr) {
        this.ShraI(this.getMemory(addr));
    }
    this.Not = function(value) {
        this.setAccuWithOverflow(~ this.accu)
        this.programPointer++;
    }
    this.Jmp = function(addr) {
        this.programPointer = addr;
    }
    this.Jmpp = function(addr) {
        if (this.getNFlag()||this.getZFlag())
            this.programPointer ++;
        else
            this.Jmp(addr);
    }
    this.Jmpnp = function(addr) {
        if (this.getNFlag()||this.getZFlag())
            this.Jmp(addr);
        else
            this.programPointer ++;
    }
    this.Jmpn = function(addr) {
        if (this.getNFlag())
            this.Jmp(addr);
        else
            this.programPointer ++;
    }
    this.Jmpnn = function(addr) {
        if (this.getNFlag())
            this.programPointer ++;
        else
            this.Jmp(addr);
    }
    this.Jmpz = function(addr) {
        if (this.getZFlag())
            this.Jmp(addr);
        else
            this.programPointer ++;
    }
    this.Jmpnz = function(addr) {
        if (this.getZFlag())
            this.programPointer ++;
        else
            this.Jmp(addr);
    }
    this.Jmpv = function(addr) {
        if (this.getVFlag())
            this.Jmp(addr);
        else
            this.programPointer ++;
    }
    this.Noop = function() {
        this.programPointer++;
    }
}

function machine() {
    
    this.alu = new alu();
    this.program = [];
    this.programLabels = {};
    this.memoryLabels = {};
    
    this.reset = function() {
        this.alu.reset();
        this.program = [];
        this.programLabels = {};
        this.memoryLabels = {};
    }
    
    this.load = function(text) {
        this.reset();
        var lines = text.split("\n");
        for( var i = 0; i < lines.length; ++i ) {
            var line = lines[i];
            if (line.match( /^\s*$/ )) {
                continue; // skip empty lines
            }
            var isComment = line.match( /^\s*#/ );
            if (isComment)
                continue;
            var label = line.match( /^\s*(\S+)\s*:(.*)$/ );
            var labelString = null;
            if (label) {
                labelString = label[1];
                line = label[2]; // continue with rest
            }
            while (line.match( /^\s*$/ ) &&  i < lines.length-1) {
                line = lines[++i]; // skip empty lines
            }
            var check2 = line.match( /^\s*(\w+)\s+(\S+)\s*$/ );
            if (check2) {
                this.program.push({ opcode: check2[1].toUpperCase(), param: check2[2], label: labelString});
                continue;
            }
            var check1 = line.match( /^\s*(\w+)\s*$/ );
            if (check1) {
                this.program.push({ opcode: check1[1].toUpperCase(), param: null, label: labelString});
                continue;
            }
            throw new Error( "Invalid instruction: " + line + " at line " + (i+1));
        }
        this.setLabels();
        return this.program;
    }
    
    this.setLabels = function() {
        var mem = 0;
        for( var i = 0; i < this.program.length; ++i ) {
            var instr = this.program[i];
            if (instr.opcode == "WORD") {
                if (instr.label != null) {
                    //console.log("Initialize " + instr.label + " at memory position " + mem + " to " + instr.param);
                    // register label
                    this.memoryLabels[instr.label] = mem;
                }
                // initialize memory
                this.alu.setMemory(mem, instr.param);
                
                mem++;
                continue;
            }
            
            if (instr.label != null) {
                this.programLabels[instr.label] = i;
            }
        }
    }
    
    this.run = function() {
        while (true) {
            if (!this.next()) {
                return; // HOLD reached
             }
        }
    }
    
    this.next = function() {
        var pos = this.alu.getProgramPointer();
        console.log("Exec @" + pos);
        if (pos >= this.program.length) {
            throw new Error( "Reached end of program");
        }
        var instruction = this.program[pos];
        return this.execute(instruction.opcode, instruction.param, instruction.label);
    }
    
    this.execute = function(code, param) {
        console.log(code + " " + param);
        switch (code) {
            case "LOAD": this.alu.Load(this.getAddress(param)); break;
            case "LOADI": this.alu.LoadI(parseInt(param)); break;
            case "STORE": this.alu.Store(this.getAddress(param)); break;
            case "ADD": this.alu.Add(this.getAddress(param)); break;
            case "ADDI": this.alu.AddI(parseInt(param)); break;
            case "SUB": this.alu.Sub(this.getAddress(param)); break;
            case "SUBI": this.alu.SubI(parseInt(param)); break;
            case "MUL": this.alu.Mul(this.getAddress(param)); break;
            case "MULI": this.alu.MulI(parseInt(param)); break;
            case "DIV": this.alu.Div(this.getAddress(param)); break;
            case "DIVI": this.alu.DivI(parseInt(param)); break;
            case "CMP": this.alu.Cmp(this.getAddress(param)); break;
            case "CMPI": this.alu.CmpI(parseInt(param)); break;
            case "MOD": this.alu.Mod(this.getAddress(param)); break;
            case "MODI": this.alu.ModI(parseInt(param)); break;
            case "AND": this.alu.And(this.getAddress(param)); break;
            case "ANDI": this.alu.AndI(parseInt(param)); break;
            case "OR": this.alu.Or(this.getAddress(param)); break;
            case "ORI": this.alu.OrI(parseInt(param)); break;
            case "XOR": this.alu.Xor(this.getAddress(param)); break;
            case "XORI": this.alu.XorI(parseInt(param)); break;
            case "SHL": this.alu.Shl(this.getAddress(param)); break;
            case "SHLI": this.alu.ShlI(parseInt(param)); break;
            case "SHR": this.alu.Shr(this.getAddress(param)); break;
            case "SHRI": this.alu.ShrI(parseInt(param)); break;
            case "SHRA": this.alu.Shra(this.getAddress(param)); break;
            case "SHRAI": this.alu.ShraI(parseInt(param)); break;
            case "NOT": this.alu.Not(); break;
            case "JMP":
                this.alu.Jmp(this.getProgramAddress(param)); break;
            case "JMPP":
            case "JGT":
                this.alu.Jmpp(this.getProgramAddress(param)); break;
            case "JMPNP":
            case "JLE":
                this.alu.Jmpnp(this.getProgramAddress(param)); break;
            case "JMPN":
            case "JLT":
                this.alu.Jmpn(this.getProgramAddress(param)); break;
            case "JMPNN":
            case "JGE":
                this.alu.Jmpnn(this.getProgramAddress(param)); break;
            case "JMPZ":
            case "JEQ":
                this.alu.Jmpz(this.getProgramAddress(param)); break;
            case "JMPNZ":
            case "JNE":
                this.alu.Jmpnz(this.getProgramAddress(param)); break;
            case "JMPV":
            case "JOV":
                this.alu.Jmpv(this.getProgramAddress(param)); break;
            case "NOOP": this.alu.Noop(); break;
            case "HOLD": return false;
            default:
                throw new Error( "Invalid opcode: " + code );
        }
        //console.log("-> " + this.alu.getAccu() + " "+(this.alu.getNFlag()?"n":"")+(this.alu.getZFlag()?"z":"")+(this.alu.getVFlag()?"v":""));
        return true;
    }
    
    this.getAddress = function(addr) {
        return this.getAddr(addr, this.memoryLabels);
    }
    
    this.getProgramAddress = function(addr) {
        return this.getAddr(addr, this.programLabels);
    }
    
    this.getAddr = function(addr, labels) {
        var indirect = false;
        var bracket = addr.match(/\((\S+)\)/);
        if (bracket) {
            addr = bracket[1];
            indirect = true;
        }
        var result = parseInt(addr);
        if (isNaN(result)) {
            var fromLabel = labels[addr];
            if (isNaN(fromLabel)) {
                throw new Error("Unknown label " + addr);
            }
            //console.log("mapping label " + addr + " to memory address " + fromLabel);
            result = fromLabel;
        }       
        if (indirect) {
            result = this.alu.getMemory(result);
        } 
        return result;
    }
    
    this.getAluStatus = function() {
        var labels = [];
        labels.push("Accu: " + m.alu.getAccu());
        labels.push("N: "+(this.alu.getNFlag()?"1":"0"));
        labels.push("Z: "+(this.alu.getZFlag()?"1":"0"));
        labels.push("V: "+(this.alu.getVFlag()?"1":"0"));
        return labels;
    }
    this.getMemoryStatus = function() {
        return Object.keys(this.memoryLabels).map(key => key + ":\t" + this.alu.getMemory(m.memoryLabels[key]))
    }
    
    this.getProgramStatus = function() {
        var result = [];
        for (var i=0; i<this.program.length; i++) {
            var instr = this.program[i];
            var entry = "";
            entry += ((this.alu.getProgramPointer() == i) ? ">\t" : "\t");
            entry += ((instr.label != null) ? (instr.label+":\t") : "\t");
            entry += instr.opcode;
            entry += ((instr.param != null) ? (" " + instr.param) : "");
            result.push(entry);
        }
        return result;
    }
}