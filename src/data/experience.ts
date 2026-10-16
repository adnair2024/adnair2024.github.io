// Placeholders in [BRACKETS] must be filled in before a production build.
// Never invent details here.
export const experience = {
  role: 'Systems Administrator',
  start: '[START]',
  end: 'now',
  org: 'Neuroscience clinic · HIPAA-regulated healthcare',
  bullets: [
    "Administer the clinic's athenaPractice EHR (formerly GE Centricity). [WHAT HE OWNS: upgrades, interfaces, user access]",
    "Work alongside the clinic's managed service provider. [WHERE HIS JOB ENDS AND THEIRS BEGINS]",
    '[SCALE: users, endpoints, sites supported]',
    '[ONE THING HE AUTOMATED, FIXED OR HARDENED, with a number]',
  ],
  education: {
    degree: 'B.S. Computer Information Systems, Loyola University New Orleans',
    honor: 'cum laude',
  },
};

const PLACEHOLDER = /\[[A-Z][A-Z :,.\-a-z]*\]/;

export function findPlaceholders(): string[] {
  const all = [experience.start, experience.org, ...experience.bullets];
  return all.filter((s) => PLACEHOLDER.test(s));
}
