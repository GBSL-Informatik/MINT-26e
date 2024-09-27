---
page_id: 55d68d05-6283-4263-b062-0c3321025478
---

import AccessControlledElement from '@tdev-components/documents/AccessControlledElement';
import BrowserWindow from '@tdev-components/BrowserWindow';

# Zugriffsgesteuerte Elemente

Wenn ein Element nur nach einer Freigabe angezeigt werden soll, eignet sich die `<AccessControlledElement>`-Komponente  - sie versteckt ihren Inhalt, bis er freigegeben wurde.

```md
<AccessControlledElement id="43ba2a38-9612-402f-9daf-91204ff47a71">
Dieser Link wird nur bei entsprechender Berechtigung angezeigt:

[🔗 https://test.com/nicht-oeffentlicher-link](https://test.com/nicht-oeffentlicher-link)
</AccessControlledElement>
```

<BrowserWindow>
<AccessControlledElement id="43ba2a38-9612-402f-9daf-91204ff47a71">
Dieser Link wird nur bei entsprechender Berechtigung angezeigt:

[🔗 https://test.com/nicht-oeffentlicher-link](https://test.com/nicht-oeffentlicher-link)
</AccessControlledElement>
</BrowserWindow>

:::warning[Daten sind nicht geheim]
Obwohl das Element im Browser nicht angezeigt wird, ist sein Inhalt dennoch im Seitenquelltext enthalten. Versierte Besucher:innen können diesen also problemlos herausfinden.
:::
