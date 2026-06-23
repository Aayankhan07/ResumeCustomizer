export default function ResumePreview({ data }) {
  if (!data) return null;

  const { contact, summary, skills, experience, education, projects, certifications } = data;

  return (
    <div className="resume-document w-full bg-white rounded-lg border border-boundary shadow-document p-4 sm:p-8 md:p-12 max-w-2xl mx-auto text-left">
      {/* Header */}
      <div className="text-center mb-5">
        <h1>{contact.name}</h1>
        <div className="text-xs text-gray-600 mt-1 flex flex-wrap justify-center gap-x-2 gap-y-1">
          {[
            contact.email,
            contact.phone,
            contact.location,
            contact.linkedin,
            contact.github,
            contact.portfolio
          ]
            .filter(Boolean)
            .map((item, idx, arr) => (
              <span key={item}>
                {item}
                {idx < arr.length - 1 && <span className="ml-2 text-gray-300">|</span>}
              </span>
            ))}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <section className="mb-4">
          <div className="section-title">Summary</div>
          <p className="text-sm leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {(skills?.technical?.length || skills?.tools?.length || skills?.soft?.length) && (
        <section className="mb-4">
          <div className="section-title">Skills</div>
          <div className="flex flex-col gap-1">
            {skills.technical?.length > 0 && (
              <p className="text-sm"><strong>Technical:</strong> {skills.technical.join(' · ')}</p>
            )}
            {skills.tools?.length > 0 && (
              <p className="text-sm"><strong>Tools:</strong> {skills.tools.join(' · ')}</p>
            )}
            {skills.soft?.length > 0 && (
              <p className="text-sm"><strong>Core:</strong> {skills.soft.join(' · ')}</p>
            )}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <section className="mb-4">
          <div className="section-title">Experience</div>
          {experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline gap-4">
                <strong className="text-sm">{exp.title}</strong>
                <span className="text-xs text-gray-500 font-mono shrink-0">{exp.start_date} – {exp.end_date}</span>
              </div>
              <div className="text-xs text-gray-600 italic mb-1">
                {[exp.company, exp.location].filter(Boolean).join(', ')}
              </div>
              <ul className="list-none space-y-0.5">
                {exp.bullets?.map((b, j) => (
                  <li key={j} className="text-sm bullet-item pl-3">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <section className="mb-4">
          <div className="section-title">Education</div>
          {education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between items-baseline gap-4">
                <strong className="text-sm">{edu.degree} in {edu.field}</strong>
                <span className="text-xs text-gray-500 font-mono shrink-0">{edu.start_year} – {edu.end_year}</span>
              </div>
              <div className="text-xs text-gray-600 italic">
                {[edu.institution, edu.location].filter(Boolean).join(', ')}
              </div>
              {edu.gpa && <div className="text-xs text-gray-500">GPA: {edu.gpa}</div>}
              {edu.highlights?.length > 0 && (
                <ul className="list-none mt-0.5">
                  {edu.highlights.map((h, j) => (
                    <li key={j} className="text-xs bullet-item pl-3 text-gray-600">{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <section className="mb-4">
          <div className="section-title">Projects</div>
          {projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <div className="flex items-center gap-2">
                <strong className="text-sm">{proj.name}</strong>
                {proj.link && (
                  <a href={proj.link} target="_blank" rel="noreferrer"
                    className="text-xs text-cobalt hover:underline">↗ Link</a>
                )}
              </div>
              <p className="text-xs leading-relaxed mt-0.5">{proj.description}</p>
              {proj.tech_stack?.length > 0 && (
                <p className="text-xs text-gray-500 italic mt-0.5">Tech: {proj.tech_stack.join(', ')}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {certifications?.length > 0 && (
        <section className="mb-4">
          <div className="section-title">Certifications</div>
          {certifications.map((cert, i) => (
            <div key={i} className="text-sm bullet-item pl-3 mb-1">
              {cert.name} — {cert.issuer}{cert.year ? ` (${cert.year})` : ''}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
