/** Qualification choices shared by the form and its server-side validation. */
export const INQUIRY_CHOICES={
 project:['Adam membership for our institution','A custom collection and reading experience','Help us explore the possibilities'],
 audience:['Under 50 people','50–250 people','251–1,000 people','1,001–10,000 people','More than 10,000 people','Not sure yet'],
 timeline:['Within 3 months','3–6 months','6–12 months','Exploring for now'],
 budget:['Not decided yet','Under $5,000','$5,000–$15,000','$15,000–$50,000','$50,000+'],
 rights:['We own or can license the works','The works are openly licensed or public domain','We need help identifying suitable sources','Not applicable / not sure yet'],
} as const;
export const INQUIRY_FIELDS={name:'Full name',email:'Work email',mobile:'Mobile number',institution:'Institution',role:'Role / department',project:'Project interests',audience:'Community size',works:'Works or subjects of interest',goals:'Teaching or research goals',rights:'Access to source materials',timeline:'Desired timeline',budget:'Indicative budget (USD)'} as const;
export type InquiryField=keyof typeof INQUIRY_FIELDS;
export type InstitutionInquiry=Record<InquiryField,string>;
export type InquiryErrors=Partial<Record<InquiryField,string>>;
export const INQUIRY_LIMITS:Record<InquiryField,number>={name:120,email:254,mobile:40,institution:200,role:160,project:500,audience:80,works:2000,goals:3000,rights:100,timeline:80,budget:80};
/** Accept the earlier single choice as well as current multi-select submissions. */
export function selectedProjects(value:unknown):string[]{
 if(value==='Both membership and a custom collection')return [INQUIRY_CHOICES.project[0],INQUIRY_CHOICES.project[1]];
 const items=Array.isArray(value)?value:typeof value==='string'?value.split(';'):[];
 if(items.some(item=>typeof item!=='string'))return [];
 return [...new Set((items as string[]).map(item=>item.trim()).filter(Boolean))];
}
export function needsCustomWorks(project:unknown){return selectedProjects(project).includes(INQUIRY_CHOICES.project[1]);}
export function validateInquiry(input:unknown):{data:InstitutionInquiry;errors:InquiryErrors}{
 const raw=input&&typeof input==='object'?input as Record<string,unknown>:{};
 const data={} as InstitutionInquiry,errors:InquiryErrors={};
 for(const field of Object.keys(INQUIRY_FIELDS) as InquiryField[]){
  const value=field==='project'?selectedProjects(raw[field]).join('; '):typeof raw[field]==='string'?(raw[field] as string).trim():'';
  data[field]=value;
  if(!value&&field!=='works'&&field!=='budget'&&field!=='mobile')errors[field]='Please complete this field.';
  else if(value.length>INQUIRY_LIMITS[field])errors[field]=`Please use ${INQUIRY_LIMITS[field]} characters or fewer.`;
  else if(field==='project'&&selectedProjects(value).some(item=>!(INQUIRY_CHOICES.project as readonly string[]).includes(item)))errors.project='Please choose from the listed project interests.';
  else if(value&&field!=='project'&&field in INQUIRY_CHOICES&&!(INQUIRY_CHOICES[field as keyof typeof INQUIRY_CHOICES] as readonly string[]).includes(value))errors[field]='Please choose one of the listed options.';
  else if(!['works','goals'].includes(field)&&/[\r\n\x00-\x1f]/.test(value))errors[field]='Please enter a single line of text.';
 }
 if(data.email&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email))errors.email='Please enter a valid email address.';
 if(data.mobile&&(!/^\+?[\d\s().-]+$/.test(data.mobile)||data.mobile.replace(/\D/g,'').length<7||data.mobile.replace(/\D/g,'').length>15))errors.mobile='Please enter a valid mobile number, including your country code.';
 if(data.goals&&data.goals.length<20)errors.goals='Please tell us a little more (at least 20 characters).';
 if(needsCustomWorks(data.project)&&!data.works)errors.works='Tell us which works or subjects you would like to explore.';
 return {data,errors};
}
