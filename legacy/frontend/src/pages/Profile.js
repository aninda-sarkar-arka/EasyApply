import { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    skills: [],
    preferredRoles: [],
    jobLocations: [],
    education: [],
    experience: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/profile');
        setProfile(res.data);
        setFormData({
          skills: res.data.profile?.skills || [],
          preferredRoles: res.data.profile?.preferredRoles || [],
          jobLocations: res.data.profile?.jobLocations || [],
          education: res.data.profile?.education || [],
          experience: res.data.profile?.experience || [],
        });
      } catch {
        setError('Could not load your profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleArrayChange = (name, value) => {
    setFormData({ ...formData, [name]: value.split(',').map(s => s.trim()).filter(Boolean) });
  };

  // Education helpers
  const addEducation = () => {
    setFormData({ ...formData, education: [...formData.education, { degree: '', institution: '', year: '' }] });
  };
  const updateEducation = (index, field, value) => {
    const updated = [...formData.education];
    updated[index] = { ...updated[index], [field]: field === 'year' ? Number(value) || '' : value };
    setFormData({ ...formData, education: updated });
  };
  const removeEducation = (index) => {
    setFormData({ ...formData, education: formData.education.filter((_, i) => i !== index) });
  };

  // Experience helpers
  const addExperience = () => {
    setFormData({ ...formData, experience: [...formData.experience, { title: '', company: '', duration: '', description: '' }] });
  };
  const updateExperience = (index, field, value) => {
    const updated = [...formData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, experience: updated });
  };
  const removeExperience = (index) => {
    setFormData({ ...formData, experience: formData.experience.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/users/profile', { profile: formData });
      setProfile({ ...profile, profile: formData });
      setEditing(false);
      setError('');
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Unable to save profile changes.');
    }
  };

  if (loading) return <section className="page page-content"><div className="notice">Loading profile...</div></section>;

  return (
    <section className="page page-content">
      <div className="page-header page-header-row">
        <div>
          <h1>Profile</h1>
          <p>Personalize your job preferences and background.</p>
        </div>
        {!editing && (
          <button type="button" className="nav-cta" onClick={() => setEditing(true)}>Edit Profile</button>
        )}
      </div>

      {error && <div className="notice error">{error}</div>}
      {success && <div className="notice success">{success}</div>}

      {!editing ? (
        <section className="panel detail-grid">
          <div className="detail-item"><p>Name</p><h3>{profile.name || '-'}</h3></div>
          <div className="detail-item"><p>Email</p><h3>{profile.email || '-'}</h3></div>
          <div className="detail-item"><p>Skills</p><h3>{profile.profile?.skills?.join(', ') || '-'}</h3></div>
          <div className="detail-item"><p>Preferred Roles</p><h3>{profile.profile?.preferredRoles?.join(', ') || '-'}</h3></div>
          <div className="detail-item"><p>Job Locations</p><h3>{profile.profile?.jobLocations?.join(', ') || '-'}</h3></div>

          {/* Education */}
          <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
            <p>Education</p>
            {(!profile.profile?.education || profile.profile.education.length === 0) ? <h3>-</h3> : (
              profile.profile.education.map((edu, i) => (
                <div className="note-card" key={i}>
                  <h4>{edu.degree || 'Degree'}</h4>
                  <p>{edu.institution || 'Institution'} {edu.year ? `• ${edu.year}` : ''}</p>
                </div>
              ))
            )}
          </div>

          {/* Experience */}
          <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
            <p>Experience</p>
            {(!profile.profile?.experience || profile.profile.experience.length === 0) ? <h3>-</h3> : (
              profile.profile.experience.map((exp, i) => (
                <div className="note-card" key={i}>
                  <h4>{exp.title || 'Title'} at {exp.company || 'Company'}</h4>
                  <p>{exp.duration || ''}</p>
                  {exp.description && <p style={{ color: '#8ca2bd' }}>{exp.description}</p>}
                </div>
              ))
            )}
          </div>
        </section>
      ) : (
        <form className="panel form-stack" onSubmit={handleSubmit}>
          <h2 style={{ color: '#f3f8ff', margin: '0 0 0.5rem' }}>Edit Profile</h2>

          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input value={formData.skills.join(', ')} onChange={(e) => handleArrayChange('skills', e.target.value)} placeholder="React, Node.js, Python..." />
          </div>
          <div className="form-group">
            <label>Preferred Roles (comma separated)</label>
            <input value={formData.preferredRoles.join(', ')} onChange={(e) => handleArrayChange('preferredRoles', e.target.value)} placeholder="Software Engineer, Frontend Dev..." />
          </div>
          <div className="form-group">
            <label>Job Locations (comma separated)</label>
            <input value={formData.jobLocations.join(', ')} onChange={(e) => handleArrayChange('jobLocations', e.target.value)} placeholder="Remote, New York, London..." />
          </div>

          {/* Education Entries */}
          <div>
            <label style={{ color: '#b1c9e8', fontSize: '0.88rem', fontWeight: 500 }}>Education</label>
            {formData.education.map((edu, i) => (
              <div className="entry-card" key={i}>
                <div className="entry-row">
                  <div className="form-group">
                    <label>Degree</label>
                    <input value={edu.degree || ''} onChange={(e) => updateEducation(i, 'degree', e.target.value)} placeholder="B.Sc. Computer Science" />
                  </div>
                  <div className="form-group">
                    <label>Institution</label>
                    <input value={edu.institution || ''} onChange={(e) => updateEducation(i, 'institution', e.target.value)} placeholder="MIT" />
                  </div>
                </div>
                <div className="entry-row">
                  <div className="form-group">
                    <label>Year</label>
                    <input type="number" value={edu.year || ''} onChange={(e) => updateEducation(i, 'year', e.target.value)} placeholder="2024" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'end' }}>
                    <button type="button" className="remove-btn" onClick={() => removeEducation(i)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addEducation}>+ Add Education</button>
          </div>

          {/* Experience Entries */}
          <div>
            <label style={{ color: '#b1c9e8', fontSize: '0.88rem', fontWeight: 500 }}>Experience</label>
            {formData.experience.map((exp, i) => (
              <div className="entry-card" key={i}>
                <div className="entry-row">
                  <div className="form-group">
                    <label>Title</label>
                    <input value={exp.title || ''} onChange={(e) => updateExperience(i, 'title', e.target.value)} placeholder="Software Engineer" />
                  </div>
                  <div className="form-group">
                    <label>Company</label>
                    <input value={exp.company || ''} onChange={(e) => updateExperience(i, 'company', e.target.value)} placeholder="Google" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input value={exp.duration || ''} onChange={(e) => updateExperience(i, 'duration', e.target.value)} placeholder="Jan 2022 - Present" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={exp.description || ''} onChange={(e) => updateExperience(i, 'description', e.target.value)} placeholder="Key responsibilities..." rows={2} />
                </div>
                <button type="button" className="remove-btn" onClick={() => removeExperience(i)}>Remove</button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addExperience}>+ Add Experience</button>
          </div>

          <div className="row-actions" style={{ marginTop: '0.5rem' }}>
            <button type="button" className="nav-cta ghost" onClick={() => setEditing(false)}>Cancel</button>
            <button type="submit" className="nav-cta">Save Changes</button>
          </div>
        </form>
      )}
    </section>
  );
};

export default Profile;