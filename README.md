# Projekt 05

## Instalacja

1.Wejdź do folderu:

``` bash
pzaw2/projekt05
```

2. Zainstaluj wymagane biblioteki:

```bash
npm install ejs express morgan cookie-parser argon2
```


3. W konsoli uruchom:

```bash
npm run generate_env
```

4. Uruchom serwer:

Przy pierwszym uruchomieniu należy wygenerować dane startowe:

```bash
npm run create-server-data
```

Komenda tworzy baze danych i podstawowe dane do gry oraz 3 przykładowe konta
użytkowników, w tym 1 konto administratora, informacje do logowania znajdą się w konsoli.

Przy kolejnych uruchomieniach należy użyć:

```bash
npm run dev
```

---

## Logowanie

1. Otwórz przeglądarkę i przejdź pod adres:

```text
http://localhost:2137/
```

2. Przed zalogowaniem serwer automatycznie przekieruje użytkownika na:

```text
/login
```

3. Zaloguj się na istniejące konto lub utwórz nowe konto i zaloguj się.

4. Po zalogowaniu użytkownik zostanie przekierowany na stronę główną.

---

## Strona główna

### Zmiana motywu

Link:

```text
Ciemny | Jasny
```

po kliknięciu zmienia motyw strony
(obecnie zmienia kolor tła z białego na szary i odwrotnie).

### Panel użytkownika

Link:

```text
HELLO <nazwa_użytkownika>
```

prowadzi do panelu użytkownika, gdzie można:

* wrócić na stronę główną (`Main page`),
* wylogować się.

### Panel administratora

Jeżeli użytkownik posiada uprawnienia administratora
(przykładowe konto administratora jest tworzone podczas generowania danych
startowych), widoczny jest dodatkowy link do panelu zarządzania użytkownikami.

Panel umożliwia:

* przegląd zapisanych gier użytkowników,
* usuwanie zapisów gier.

Jeżeli w bazie nie ma żadnych zapisów, wyświetlana jest odpowiednia informacja.
W przeciwnym przypadku wyświetlana jest nazwa zapisu oraz właściciel,
a obok znajduje się przycisk usuwania.

---

## Wybór zapisu gry

Jeżeli użytkownik ma wybrany zapis gry, jego nazwa jest wyświetlana
na stronie głównej.

Użytkownik może:

* wybrać istniejący zapis gry,
* utworzyć nowy zapis gry.

Dopóki żaden zapis nie zostanie wybrany, pozostałe funkcje strony
są niedostępne.

---

## Zarządzanie planszą

Przy użyciu pól tekstowych można:

* dodawać budynki na planszę,
* usuwać budynki,
* zastępować istniejące budynki innymi.

### Zasady

* Puste pole oznaczone jest jako `0`.
* Budynki oznaczone są pojedynczymi literami.
* Aby usunąć budynek, wpisz:

```text
0
```

* Aby zastąpić budynek, wpisz nazwę budynku, który ma zostać postawiony
  na danym polu. 

### Dodawanie przestrzeni

Przycisk:

```text
Submit
```

w sekcji „Dodaj przestrzeń” zwiększa rozmiar planszy o jeden wiersz
i jedną kolumnę.

Przykład:

```text
4x4 → 5x5
```

---

## Współrzędne planszy

Podczas wskazywania pola:

* `X` oznacza numer wiersza,
* `Y` oznacza pozycję od lewej strony w wierszu.

Obie wartości są indeksowane od `1`.

Przykład:

```text
(1,1)
```

oznacza pierwsze pole w pierwszym wierszu.

---

## Zapisywanie gry

W polu znajdującym się pod napisem:

```text
Nazwa save'a
```

można:

### Utworzyć nowy zapis

Wpisz nazwę nowego zapisu.

### Nadpisać aktualny zapis

Pozostaw pole puste.

Po utworzeniu nowego zapisu użytkownik będzie musiał ponownie wybrać zapis
gry z listy.

---

## Budynki

Nazwy budynków należy podawać po angielsku, rozpoczynając je wielką literą.

Dostępne budynki:

* `House`
* `Road`

Każdy budynek posiada przypisaną wielką literę
(obecnie jest to pierwsza litera nazwy budynku),
która pojawia się na planszy w odpowiednim miejscu.

---

## Obsługa błędów

W przypadku podania niepoprawnych danych serwer wyświetli komunikat błędu
i poprosi użytkownika o ponowne wprowadzenie danych.

---

## Strona About

Pod adresem:

```text
/about
```

znajduje się krótki opis projektu oraz link umożliwiający powrót
na stronę główną.

