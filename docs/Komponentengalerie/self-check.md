---
page_id: f632a479-cfe4-4a98-848a-a0dd0e0f6535
---

import SelfCheckTaskState from '@tdev-components/documents/SelfCheck/SelfCheckTaskState';
import SelfCheckContent from '@tdev-components/documents/SelfCheck/SelfCheckContent';
import SelfCheck from '@tdev-components/documents/SelfCheck';
import { SelfCheckStateType } from '@tdev-components/documents/SelfCheck/models';
import Solution from '@tdev-components/documents/Solution';
import BrowserWindow from '@tdev-components/BrowserWindow';

# Selfcheck

Mit den Komponenten `<SelfCheck>` und `<SelfCheckTaskState>` lässt sich ein einfaches "Selfcheck-Szenario" (also eine Übung mit Selbstkontrolle) umsetzen:

:::warning[Solution ID]
Die `solutionId` auf der `<Selfcheck>`-Komponente und die `id` auf der `<Solution>` müssen identisch sein.
:::

```md
<SelfCheck taskStateId="841c3390-17d5-42e5-bd9f-e50e46c97625" solutionId="71ed3d23-19d4-4575-9117-9cac09749223">
    :::note[Aufgabe 1]
    <SelfCheckTaskState />

    Erstelle eine Lösung für diese Aufgabe.

    <Solution id="71ed3d23-19d4-4575-9117-9cac09749223">
    Hallo Welt 🌍
    </Solution>
    :::
</SelfCheck>
```

<BrowserWindow>
<SelfCheck taskStateId="841c3390-17d5-42e5-bd9f-e50e46c97625" solutionId="71ed3d23-19d4-4575-9117-9cac09749223">
:::note[Aufgabe 1]
<SelfCheckTaskState />
Erstelle eine Lösung für diese Aufgabe.
<Solution id="71ed3d23-19d4-4575-9117-9cac09749223">
Hallo Welt 🌍
</Solution>
:::
</SelfCheck>
</BrowserWindow>

Die im Task State verfügbaren Zustände sind abhängig davon, ob die Lösung bereits verfügbar ist.

Die Interpretation der verschiedenen Zustände ist wie folgt vorgesehen:

| Zustand                                                | Interpretation                                                                                                                                                                                                    |
|--------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| :mdi[checkbox-blank-outline] Offen                     | Aufgabe in Bearbeitung / noch nicht begonnen.                                                                                                                                                                     |
| :mdi[account-question-outline]{.orange} Frage          | Die Schülerin braucht zur weiteren Bearbeitung die Unterstützung der Lehrperson. Dieser Status ist optional und kann mit `<SelfCheckTaskState includeQuestion={false} />` entfernt werden.                        |
| :mdi[star-outline]{color=gold} Warten auf Musterlösung | Der Schüler ist mit der Bearbeitung der Aufgabe fertig, die Musterlösung ist jedoch noch nicht verfügbar. Die Lehrperson kann nun die Musterlösung freischalten oder den/die Schüler:in um Überarbeitung bitten.  |
| :mdi[star]{color=gold} Korrektur                       | Die Schülerin ist mit der Bearbeitung der Aufgabe fertig, die Musterlösung ist verfügbar. Die eigene Antwort soll nun mit der Musterlösung verglichen und bei Bedarf verbesser werden.                            |
| :mdi[checkbox-marked-outline]{.green} Fertig           | Die Bearbeitung der Aufgabe ist abgeschlossen - die eigene Antwort des Schülers ist nun vollständig und korrekt.                                                                                                  |

## Statusabhängige Sichtbarkeit
Wenn gewisse Elemente (z.B. die Musterlösung, Hinweise, etc.) nur während bestimmten Zuständen sichtbar sein sollen, eignet sich die `SelfCheckContent`-Komponente.

Standardmässig zeigt sie ihren Inhalt nur in den Zuständen _Warten auf Musterlösung_ und _Korrektur_ an. Dies kann mit den Eigenschaften `visibleFrom` und `visibleTo` angepasst werden. Es stehen dafür je folgende Konstanten zur Verfügung:

| Zustand                                                | Konstante                               |
|--------------------------------------------------------|-----------------------------------------|
| :mdi[checkbox-blank-outline] Offen                     | `SelfCheckStateType.Open`               |
| :mdi[account-question-outline]{.orange} Frage          | `SelfCheckStateType.Question`           |
| :mdi[star-outline]{color=gold} Warten auf Musterlösung | `SelfCheckStateType.WaitingForSolution` |
| :mdi[star]{color=gold} Korrektur                       | `SelfCheckStateType.Reviewing`          |
| :mdi[checkbox-marked-outline]{.green} Fertig           | `SelfCheckStateType.Done`               |

Zudem zeigt sie ihren Inhalt für Lehrpersonen standardmässig immer an. Dieses Verhalten kann mit `<SelfCheckContent alwaysVisibleForTeacher={false}>` angepasst werden.

Folgendes Beispiel enthält ein Selfcheck-Szenario, in dem die Musterlösung (ausser für Lehrpersonen) nur in den Zuständen _Warten auf Musterlösung_ (als nicht-verfügbar) und _Korrektur_ angezeigt wird. Zudem wird den Zuständen _Frage_, _Warten auf Musterlösung_ und _Korrektur_ je ein spezifischer Hinweis angezeigt. Diese Hinweise sind auch für Lehrpersonen nur im entsprechenden Zustand sichtbar.

```md
<SelfCheck taskStateId="df3313a5-c18f-4220-9dfe-cf4314c1b7b9" solutionId="e92b6f49-396e-48bc-8a6c-4ca94947210d">
    :::note[2. Aufgabe]
    <SelfCheckTaskState />
    
    Erstelle auch für diese Aufgabe eine Lösung.
    
    <SelfCheckContent>
        <Solution id="e92b6f49-396e-48bc-8a6c-4ca94947210d">
        Lösung zur zweiten Aufgabe 🥳
        </Solution>
    </SelfCheckContent>
    :::
    
    <SelfCheckContent alwaysVisibleForTeacher={false} visibleTo={SelfCheckStateType.WaitingForSolution}>
        :::info[Auf Musterlösung warten]
        Die Lehrperson wird dir die Musterlösung bald freischalten.
        :::
    </SelfCheckContent>
    
    <SelfCheckContent alwaysVisibleForTeacher={false} visibleFrom={SelfCheckStateType.Reviewing}>
        :::info[Selbstständig korrigieren]
        Vergleiche deine Lösung nun mit der Musterlösung und korrigiere deine Antwort.
        :::
    </SelfCheckContent>
    
    <SelfCheckContent alwaysVisibleForTeacher={false} visibleFrom={SelfCheckStateType.Question} visibleTo={SelfCheckStateType.Question}>
        :::info[Frage?]
        Wenn du während des Unterrichts eine Frage hast, dann kannst du jederzeit die Lehrperson rufen.
        :::
    </SelfCheckContent>
</SelfCheck>
```

<BrowserWindow>
<SelfCheck taskStateId="df3313a5-c18f-4220-9dfe-cf4314c1b7b9" solutionId="e92b6f49-396e-48bc-8a6c-4ca94947210d">
    :::note[2. Aufgabe]
    <SelfCheckTaskState />
    
    Erstelle auch für diese Aufgabe eine Lösung.
    
    <SelfCheckContent>
        <Solution id="e92b6f49-396e-48bc-8a6c-4ca94947210d">
        Lösung zur zweiten Aufgabe 🥳
        </Solution>
    </SelfCheckContent>
    :::
    
    <SelfCheckContent alwaysVisibleForTeacher={false} visibleTo={SelfCheckStateType.WaitingForSolution}>
        :::info[Auf Musterlösung warten]
        Die Lehrperson wird dir die Musterlösung bald freischalten.
        :::
    </SelfCheckContent>
    
    <SelfCheckContent alwaysVisibleForTeacher={false} visibleFrom={SelfCheckStateType.Reviewing}>
        :::info[Selbstständig korrigieren]
        Vergleiche deine Lösung nun mit der Musterlösung und korrigiere deine Antwort.
        :::
    </SelfCheckContent>
    
    <SelfCheckContent alwaysVisibleForTeacher={false} visibleFrom={SelfCheckStateType.Question} visibleTo={SelfCheckStateType.Question}>
        :::info[Frage?]
        Wenn du während des Unterrichts eine Frage hast, dann kannst du jederzeit die Lehrperson rufen.
        :::
    </SelfCheckContent>
</SelfCheck>
</BrowserWindow>
