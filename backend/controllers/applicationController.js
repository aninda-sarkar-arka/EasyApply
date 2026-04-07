const Application = require('../models/Application');

exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id }).sort({ appliedDate: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createApplication = async (req, res) => {
  const { company, role, status, deadline } = req.body;
  try {
    const application = new Application({
      user: req.user.id,
      company,
      role,
      status,
      deadline,
    });
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });

    if (application.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const updatedApplication = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedApplication);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });

    if (application.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await Application.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Application removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};