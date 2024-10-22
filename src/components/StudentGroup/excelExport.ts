import StudentGroup from '@tdev-models/StudentGroup';
import ExcelJS from 'exceljs';
import siteConfig from '@generated/docusaurus.config';
import saveAs from '@tdev-components/util/saveAs';

export async function exportAsExcelSpreadsheet(group: StudentGroup) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = siteConfig.title;
    workbook.lastModifiedBy = siteConfig.title;
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet(group.name);

    // TODO: Filter cols?
    sheet.insertRow(1, ['', 'ID', 'Vorname', 'Nachname']);

    // TODO: Fit row width.
    group.students.forEach((student, index) => {
        sheet.insertRow(index + 2, ['', student.id, student.firstName, student.lastName]);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = `Lerngruppe ${group.name}.xlsx`;
    saveAs(blob, filename);
}