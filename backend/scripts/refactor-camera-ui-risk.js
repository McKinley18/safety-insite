const fs = require('fs');
let content = fs.readFileSync('frontend/app/tabs/camera.tsx', 'utf8');

const standardsSection = '<Section id="standards"';
const nextSection = '<Section id="location-action"';

const startIdx = content.indexOf(standardsSection);
const endIdx = content.indexOf(nextSection, startIdx);

const newStandardsUI = `
          <Section id="standards" sectionOffsets={sectionOffsets} title="3. Standards Review" helper="Review suggested MSHA standards and risk assessment.">
            <TouchableOpacity style={styles.primaryButton} onPress={async () => {
                await runStandardMatch();
                const risk = await apiClient.riskSuggest({
                    hazardCategory: currentHazard.hazardCategory,
                    hazardDescription: currentHazard.hazardDescription
                });
                updateHazard({ riskAssessment: risk });
            }}>
              <Text style={styles.primaryButtonText}>Check Standards & Risk</Text>
            </TouchableOpacity>

            {currentHazard.riskAssessment && (
              <View style={[styles.standardCard, { borderColor: "#E5E7EB", padding: 16 }]}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Risk Assessment: {currentHazard.riskAssessment.riskLevel}</Text>
                <Text style={{ fontSize: 14 }}>Severity: {currentHazard.riskAssessment.severitySuggestion}</Text>
                <Text style={{ fontSize: 14 }}>Likelihood: {currentHazard.riskAssessment.likelihoodSuggestion}</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Score: {currentHazard.riskAssessment.riskScore}</Text>
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

content = content.substring(0, startIdx) + newStandardsUI + content.substring(endIdx);
fs.writeFileSync('frontend/app/tabs/camera.tsx', content);
