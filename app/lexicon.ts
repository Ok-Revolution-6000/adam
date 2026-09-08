/** Anatomical vocabulary of the classical texts, mapped to atlas concept names.
 * A word in the reading pane that matches a key becomes a live link that highlights those structures.
 * Keys are lower-case; the reader matches them case-insensitively on word boundaries. */
export const LEXICON:Record<string,string[]> = {
 // respiration
 'lungs':['right lung','left lung'],'lung':['right lung','left lung'],
 'chest':['chest wall','right lung','left lung'],'thorax':['chest wall'],'breast':['chest wall'],'sternum':['sternum'],'breastbone':['sternum'],'ribs':['rib cage'],'rib':['rib cage'],
 'windpipe':['trachea'],'trachea':['trachea'],'bronchi':['tracheobronchial tree'],'bronchus':['tracheobronchial tree'],'bronchial':['tracheobronchial tree'],
 'throat':['epiglottis','thyroid cartilage','muscle of larynx','muscle of pharynx'],'larynx':['epiglottis','thyroid cartilage','muscle of larynx'],'pharynx':['muscle of pharynx'],'uvula':['muscle of pharynx'],
 'gullet':['esophagus'],'mouth of the stomach':['esophagus','stomach'],'cardia':['esophagus','stomach'],'esophagus':['esophagus'],'oesophagus':['esophagus'],
 'diaphragm':['diaphragm'],'midriff':['diaphragm'],'nose':['nose'],'nostrils':['nose'],'nostril':['nose'],
 // head and nerves
 'brain':['brain'],'head':['brain','skull'],'skull':['skull'],'cranium':['skull'],
 'nerves':['nervous system'],'nerve':['nervous system'],'spinal marrow':['spinal cord'],'spinal cord':['spinal cord'],'spine':['vertebral column'],'backbone':['vertebral column'],'vertebrae':['vertebral column'],'vertebra':['vertebral column'],
 'eyes':['right eye','left eye'],'eye':['right eye','left eye'],'ears':['external ear'],'ear':['external ear'],'face':['face'],'neck':['neck'],'hair':['hair'],
 'mouth':['mouth'],'tongue':['tongue'],'teeth':['tooth'],'tooth':['tooth'],'gums':['tooth'],
 // heart and vessels
 'heart':['heart'],'arteries':['systemic arterial system'],'artery':['systemic arterial system'],'aorta':['aorta'],
 'veins':['systemic venous system','portal vein'],'vein':['systemic venous system','portal vein'],'pulse':['aorta','systemic arterial system'],
 // digestion
 'stomach':['stomach'],'belly':['stomach','small intestine','large intestine'],'abdomen':['stomach','small intestine','large intestine'],
 'liver':['liver'],'spleen':['spleen'],'gallbladder':['gallbladder'],'gall bladder':['gallbladder'],'gall':['gallbladder'],'bile':['gallbladder','bile duct'],
 'intestines':['small intestine','large intestine'],'intestine':['small intestine','large intestine'],'bowels':['small intestine','large intestine'],'bowel':['small intestine','large intestine'],'guts':['small intestine','large intestine'],
 'colon':['ascending colon','transverse colon','descending colon'],'rectum':['rectum'],'anus':['rectum'],'fundament':['rectum'],'hemorrhoids':['rectum'],'haemorrhoids':['rectum'],
 'pancreas':['pancreas'],'mesentery':['mesentery of small intestine','mesentery of large intestine'],'peritoneum':['peritoneum'],
 // urine and generation
 'kidneys':['kidney'],'kidney':['kidney'],'bladder':['urinary bladder'],'urethra':['urethra'],'ureters':['ureter'],
 'testicles':['testis','epididymis'],'testicle':['testis','epididymis'],'testes':['testis','epididymis'],'testis':['testis'],
 'penis':['glans penis','corpus spongiosum of penis','corpus cavernosum of penis'],'scrotum':['testis','epididymis'],'prostate':['prostate'],
 'semen':['testis','seminal vesicle','prostate'],'sperm':['testis','seminal vesicle','prostate'],'genitals':['testis','prostate','seminal vesicle','glans penis'],
 // surface and frame
 'skin':['skin'],'pores':['skin'],'muscles':['muscle organ'],'muscle':['muscle organ'],'flesh':['muscle organ'],'bones':['bone organ'],'bone':['bone organ'],'joints':['bone organ'],'joint':['bone organ'],
 'hands':['right hand','left hand'],'hand':['right hand','left hand'],'feet':['right foot','left foot'],'foot':['right foot','left foot'],'legs':['right lower limb','left lower limb'],'thighs':['right lower limb','left lower limb'],'leg':['right lower limb','left lower limb'],'arms':['right upper limb','left upper limb'],'arm':['right upper limb','left upper limb'],
 'thymus':['thymus'],'adrenal glands':['adrenal gland'],
};
