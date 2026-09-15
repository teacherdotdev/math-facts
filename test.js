"use strict";

const fs = require("fs");
const vm = require("vm");

const html = fs.readFileSync("index.html", "utf8");
const match = html.match(/<script>\s*([\s\S]*?)<\/script>/);
if(!match) throw new Error("Could not find the application script.");

/* Exercise the pure question-building code without bringing in a browser DOM. */
const pure = match[1].split("/* ---------- State ---------- */")[0];
const checks = `
function assert(condition, message){ if(!condition) throw new Error(message); }

SETS.forEach(function(set, index){
  const round = buildSession(index);
  assert(round.length === TOTAL, "Multiplication " + set.id + " should have 36 questions");
  round.forEach(function(q){
    assert(q.op === "×", "Multiplication question has the wrong operation");
    assert(q.answer === q.a * q.b, "Incorrect multiplication answer");
  });
});

SIGNED_SKILLS.forEach(function(skill, index){
  for(let pass = 0; pass < 40; pass++){
    const round = buildSignedSession(index);
    const patterns = {};
    let additions = 0;
    round.forEach(function(q, questionIndex){
      const expected = q.op === "+" ? q.a + q.b : (q.op === "×" ? q.a * q.b : q.a - q.b);
      assert(q.answer === expected, "Incorrect signed answer");
      if(skill.limitType === "factors"){
        assert(Math.abs(q.a) <= skill.limit && Math.abs(q.b) <= skill.limit, "Signed factor outside selected range");
      } else {
        assert(Math.abs(q.answer) <= skill.limit, "Signed answer outside selected range");
      }
      assert(q.a !== 0 && q.b !== 0, "Signed practice should use nonzero operands");
      if(skill.operation !== "mixed") assert(q.op === skill.operation, "Unexpected operation");
      if(q.op === "+") additions++;
      const pattern = q.op + ":" + (q.a > 0 ? "+" : "-") + ":" + (q.b > 0 ? "+" : "-");
      patterns[pattern] = (patterns[pattern] || 0) + 1;
      if(questionIndex > 0) assert(q.key !== round[questionIndex - 1].key, "Adjacent duplicate question");
    });
    assert(round.length === TOTAL, skill.label + " should have 36 questions");
    if(skill.operation === "mixed") assert(additions === 18, skill.label + " should have 18 additions");
    Object.keys(patterns).forEach(function(pattern){
      const count = patterns[pattern];
      if(skill.operation === "mixed") assert(count === 4 || count === 5, "Unbalanced mixed sign pattern " + pattern);
      else assert(count === 9, "Unbalanced sign pattern " + pattern);
    });
    assert(Object.keys(patterns).length === (skill.operation === "mixed" ? 8 : 4), "Missing sign pattern");
  }
});

assert(questionSentence(signedQuestion(5, -3, "-")) === "Five minus negative three is eight.", "Correction sentence mismatch");
assert(formatInteger(-8) === "−8", "Displayed negative sign mismatch");
`;

vm.runInNewContext(pure + checks, { console });
console.log("Question generation checks passed.");
