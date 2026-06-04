const fs = require('fs');
let content = fs.readFileSync('frontend/app/tabs/camera.tsx', 'utf8');

// Logic: Add riskAssessment to currentHazard state and inject the UI block
// I'll target the end of the <Section id="standards" ...>
const standardsSection = '<Section id="standards"';
const closingSection = '</Section>';

const startIdx = content.indexOf(standardsSection);
const endIdx = content.indexOf(closingSection, startIdx) + closingSection.length;

const updatedSection = `
          <Section id="standards" sectionOffsets={sectionOffsets} title="3. Standards & Risk" helper="MSHA/OSHA standards and risk assessment.">
            <TouchableOpacity style={styles.primaryButton} onPress={async () => {
                await runStandardMatch();
                const risk = await apiClient.riskSuggest({
                    hazardCategory: currentHazard.hazardCategory,
                    hazardDescription: currentHazard.hazardDescription,
                    citation: currentHazard.selectedStandard
                });
                updateHazard({ riskAssessment: risk });
            }}>
              <Text style={styles.primaryButtonText}>Check Standards & Risk</Text>
            </TouchableOpacity>

            {currentHazard.riskAssessment && (
              <View style={[styles.standardCard, { borderColor: "#F97316", padding: 16 }]}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Risk Assessment: {currentHazard.riskAssessment.riskLevel}</Text>
                <Text>Score: {currentHazard.riskAssessment.riskScore} | Priority: {currentHazard.riskAssessment.priorityLabel}</Text>
                <Text style={{ fontSize: 12, marginTop: 8, color: '#475467' }}>{currentHazard.riskAssessment.riskReasoning}</Text>
              </View>
            )}
            
            {currentHazard.possibleStandards.map((standard) => (
              <View key={standard.citation} style={styles.standardCard}>
                 <Text style={styles.standardCitation}>{standard.citation}</Text>
                 <Text style={styles.standardText}>{standard.heading}</Text>
              </View>
            ))}
          </Section>
`;

content = content.substring(0, startIdx) + updatedSection + content.substring(endIdx);
fs.writeFileSync('frontend/app/tabs/camera.tsx', content);
