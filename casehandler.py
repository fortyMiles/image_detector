import os


def get_cases_pics():
    lefts = []
    rights = []
    results = []

    path = 'static/cases'
    files = [file for file in os.listdir(path)]
    files = sorted(files, reverse=True)
    print(files)

    for index, file in enumerate(files):
        if file.endswith('01.jpg'):
            lefts.append(path + '/' + file)
        else:
            rights.append(path + '/' + file)

        if index % 2 == 0 and file.startswith('01'):
            results.append(True)
        elif index % 2 == 0:
            results.append(False)

    return lefts, rights, results


if __name__ == '__main__':
    lefts, rights, results = get_cases_pics()
    print(lefts)
    print(rights)
    print(results)
