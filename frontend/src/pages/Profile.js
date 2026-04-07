import { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/profile');
        setProfile(res.data);
        setFormData(res.data.profile || {});
      } catch {
        setError('Could not load your profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['skills', 'preferredRoles', 'jobLocations'].includes(name)) {
      setFormData({ ...formData, [name]: value.split(',').map(s => s.trim()) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/users/profile', { profile: formData });
      setProfile({ ...profile, profile: formData });
      setEditing(false);
      setError('');
    } catch {
      setError('Unable to save profile changes.');
    }
  };

  if (loading) {
    return <section className="page page-content"><div className="notice">Loading profile...</div></section>;
  }

  return (
    <section className="page page-content">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Personalize your job preferences and background.</p>
      </div>
      {error && <div className="notice error">{error}</div>}
      {!editing ? (
        <section className="panel detail-grid">
          <div className="detail-item"><p>Name</p><h3>{profile.name || '-'}</h3></div>
          <div className="detail-item"><p>Email</p><h3>{profile.email || '-'}</h3></div>
          <div className="detail-item"><p>Skills</p><h3>{profile.profile?.skills?.join(', ') || '-'}</h3></div>
          <div className="detail-item"><p>Preferred Roles</p><h3>{profile.profile?.preferredRoles?.join(', ') || '-'}</h3></div>
          <div className="detail-item"><p>Job Locations</p><h3>{profile.profile?.jobLocations?.join(', ') || '-'}</h3></div>
          <div className="detail-item"><p>Education</p><h3>{JSON.stringify(profile.profile?.education || [])}</h3></div>
          <div className="detail-item"><p>Experience</p><h3>{JSON.stringify(profile.profile?.experience || [])}</h3></div>
          <div>
            <button type="button" className="nav-cta" onClick={() => setEditing(true)}>Edit Profile</button>
          </div>
        </section>
      ) : (
        <form className="panel form-stack" onSubmit={handleSubmit}>
          <h2>Edit Profile</h2>
          <label htmlFor="skills">Skills (comma separated)</label>
          <input
            id="skills"
            type="text"
            name="skills"
            value={formData.skills?.join(', ') || ''}
            onChange={handleChange}
          />
          <label htmlFor="preferredRoles">Preferred Roles (comma separated)</label>
          <input
            id="preferredRoles"
            type="text"
            name="preferredRoles"
            value={formData.preferredRoles?.join(', ') || ''}
            onChange={handleChange}
          />
          <label htmlFor="jobLocations">Job Locations (comma separated)</label>
          <input
            id="jobLocations"
            type="text"
            name="jobLocations"
            value={formData.jobLocations?.join(', ') || ''}
            onChange={handleChange}
          />
          <label htmlFor="education">Education (JSON format)</label>
          <textarea
            id="education"
            name="education"
            value={JSON.stringify(formData.education || [], null, 2)}
            onChange={(e) => {
              try {
                setFormData({ ...formData, education: JSON.parse(e.target.value) });
              } catch {
                // invalid JSON
              }
            }}
          />
          <label htmlFor="experience">Experience (JSON format)</label>
          <textarea
            id="experience"
            name="experience"
            value={JSON.stringify(formData.experience || [], null, 2)}
            onChange={(e) => {
              try {
                setFormData({ ...formData, experience: JSON.parse(e.target.value) });
              } catch {
                // invalid JSON
              }
            }}
          />
          <div className="row-actions">
            <button type="button" className="nav-cta ghost" onClick={() => setEditing(false)}>Cancel</button>
            <button type="submit" className="nav-cta">Save Changes</button>
          </div>
        </form>
      )}
    </section>
  );
};

export default Profile;