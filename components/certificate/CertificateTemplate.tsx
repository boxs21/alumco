import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const C = {
  navy:    '#15182b',
  blue:    '#2d4a8a',
  blueLight: '#eaf0fb',
  border:  '#e8e4dc',
  surface: '#f7f5f0',
  weak:    '#6b7185',
  muted:   '#a5a9b8',
  white:   '#ffffff',
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: C.white,
    padding: 0,
  },
  // Top accent bar
  topBar: {
    height: 8,
    backgroundColor: C.blue,
  },
  // Bottom accent bar
  bottomBar: {
    height: 8,
    backgroundColor: C.blue,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  body: {
    flex: 1,
    paddingHorizontal: 60,
    paddingVertical: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerLabel: {
    fontSize: 9,
    color: C.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: C.blue,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  certLabel: {
    fontSize: 9,
    color: C.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  presentsText: {
    fontSize: 12,
    color: C.weak,
    marginBottom: 10,
  },
  studentName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: C.navy,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  nameLine: {
    height: 2,
    width: 200,
    backgroundColor: C.blue,
    marginBottom: 20,
    opacity: 0.3,
  },
  bodyText: {
    fontSize: 12,
    color: C.weak,
    marginBottom: 8,
    lineHeight: 1.5,
  },
  courseName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: C.blue,
    marginTop: 4,
    marginBottom: 20,
    maxWidth: 460,
    lineHeight: 1.4,
  },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.blueLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: C.blue,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  signatureBlock: {
    alignItems: 'flex-start',
  },
  signatureLine: {
    width: 140,
    height: 1,
    backgroundColor: C.navy,
    marginBottom: 5,
    opacity: 0.3,
  },
  signatureLabel: {
    fontSize: 9,
    color: C.weak,
    letterSpacing: 0.3,
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: C.navy,
    marginTop: 1,
  },
  metaBlock: {
    alignItems: 'flex-end',
  },
  metaText: {
    fontSize: 9,
    color: C.muted,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 9,
    color: C.weak,
    fontWeight: 'bold',
  },
  verificationBox: {
    backgroundColor: C.surface,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 6,
    alignItems: 'center',
  },
  verificationLabel: {
    fontSize: 7,
    color: C.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  verificationCode: {
    fontSize: 9,
    fontWeight: 'bold',
    color: C.navy,
    letterSpacing: 1.5,
  },
});

interface CertificateTemplateProps {
  studentName: string;
  courseName: string;
  issueDate: string;
  verificationCode: string;
  score?: number | null;
  logoSrc?: string;
}

const CertificateTemplate = ({
  studentName,
  courseName,
  issueDate,
  verificationCode,
  score,
  logoSrc,
}: CertificateTemplateProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.topBar} />

      <View style={styles.body}>
        {/* Header */}
        <View style={styles.header}>
          {logoSrc ? (
            <Image style={styles.logo} src={logoSrc} />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: C.blue }}>ALUMCO</Text>
          )}
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Documento oficial</Text>
            <Text style={styles.headerTitle}>Certificado de Aprobación</Text>
          </View>
        </View>

        {/* Body */}
        <Text style={styles.certLabel}>Este certificado acredita que</Text>
        <Text style={styles.studentName}>{studentName}</Text>
        <View style={styles.nameLine} />

        <Text style={styles.bodyText}>ha completado y aprobado satisfactoriamente la capacitación:</Text>
        <Text style={styles.courseName}>{courseName}</Text>

        {score !== undefined && score !== null && (
          <View style={styles.scoreChip}>
            <Text style={styles.scoreText}>Calificación: {score}%</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Dirección de Capacitación</Text>
            <Text style={styles.signatureLabel}>ONG ALUMCO</Text>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaText}>Fecha de emisión</Text>
            <Text style={styles.metaValue}>{issueDate}</Text>
            <View style={styles.verificationBox}>
              <Text style={styles.verificationLabel}>Código de verificación</Text>
              <Text style={styles.verificationCode}>{verificationCode.slice(0, 8).toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomBar} />
    </Page>
  </Document>
);

export default CertificateTemplate;
