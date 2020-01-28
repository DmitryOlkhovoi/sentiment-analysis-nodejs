const express = require('express');
const natural = require('natural');
const aposToLexForm = require('apos-to-lex-form');
const SpellCorrector = require('spelling-corrector');
const SW = require('stopword');

const router = express.Router();

const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();

router.post('/', function(req, res, next) {
  const { text } = req.body;
  const lexedText = aposToLexForm(text);
  const casedReview = lexedText.toLowerCase();
  const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '')

  const { WordTokenizer } = natural;
  const tokenizer = new WordTokenizer();
  const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);
  
  tokenizedReview.forEach((word, index) => {
    tokenizedReview[index] = spellCorrector.correct(word);
  });

   const filteredReview = SW.removeStopwords(tokenizedReview);
   
   const { SentimentAnalyzer, PorterStemmer } = natural;
   const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
   const analysis = analyzer.getSentiment(filteredReview);

   res.status(200).json({ analysis });

 });

module.exports = router;