const axios = require('axios');

exports.resumeReview = async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  try {
    const response = await axios.post(process.env.AI_API_URL, {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Review this resume for the job: ${jobDescription}. Resume: ${resumeText}` }],
    }, {
      headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
    });
    res.json({ feedback: response.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ msg: 'AI service error' });
  }
};

exports.jobMatch = async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  try {
    const response = await axios.post(process.env.AI_API_URL, {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `How well does this resume match the job? Job: ${jobDescription}. Resume: ${resumeText}` }],
    }, {
      headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
    });
    res.json({ match: response.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ msg: 'AI service error' });
  }
};

exports.improveBullet = async (req, res) => {
  const { bullet } = req.body;
  try {
    const response = await axios.post(process.env.AI_API_URL, {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Improve this resume bullet point: ${bullet}` }],
    }, {
      headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
    });
    res.json({ improved: response.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ msg: 'AI service error' });
  }
};

exports.generateCoverLetter = async (req, res) => {
  const { jobDescription, userProfile } = req.body;
  try {
    const response = await axios.post(process.env.AI_API_URL, {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Generate a cover letter for this job: ${jobDescription}. User profile: ${userProfile}` }],
    }, {
      headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
    });
    res.json({ coverLetter: response.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ msg: 'AI service error' });
  }
};

exports.generateInterviewQuestions = async (req, res) => {
  const { jobDescription, role } = req.body;
  try {
    const response = await axios.post(process.env.AI_API_URL, {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Generate interview questions for ${role}. Job: ${jobDescription}` }],
    }, {
      headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
    });
    res.json({ questions: response.data.choices[0].message.content.split('\n') });
  } catch (err) {
    res.status(500).json({ msg: 'AI service error' });
  }
};