// Placeholders in [BRACKETS] must be filled in before a production build.
// Never invent details here.
export const experience = {
  role: 'Systems Administrator',
  org: 'Neuroscience clinic · HIPAA-regulated healthcare',
  bullets: [
    "Administer the clinic's athenaPractice EHR (formerly GE Centricity): upgrades, UI, user access, and form management in MEL.",
    'Support a team of employees across two facilities in one state.',
    'Automated ultrasound backups.',
    'Built and revised forms for clinical and office users.',
  ],

  education: {
    degree: 'B.S. Computer Information Systems, Loyola University New Orleans',
    honor: 'cum laude',
  },
};

const PLACEHOLDER = /\[[A-Z][A-Z :,.\-a-z]*\]/;

export function findPlaceholders(): string[] {
  const all = [experience.org, ...experience.bullets];
  return all.filter((s) => PLACEHOLDER.test(s));
}
