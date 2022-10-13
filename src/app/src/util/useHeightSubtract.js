import { useSelector } from 'react-redux';

function useElementsHeight(className) {
    return Array.from(document.getElementsByClassName(className)).reduce(
        (sum, x) => sum + x.offsetHeight,
        0,
    );
}

function useFooterHeight() {
    return useElementsHeight('footer-height-contributor');
}

function useHeaderHeight() {
    return useElementsHeight('header-height-contributor');
}

function useResultListSubtractHeight() {
    return useElementsHeight('results-height-subtract');
}

function useFilterListSubtractHeight() {
    return useElementsHeight('filter-list-subtract');
}

function useWindowHeight() {
    return useSelector(state => state.ui.window.innerHeight);
}

export function useResultListHeight() {
    return (
        useWindowHeight() -
        useHeaderHeight() -
        useFooterHeight() -
        useResultListSubtractHeight()
    );
}

export function useFilterListHeight() {
    return (
        useWindowHeight() -
        useHeaderHeight() -
        useFooterHeight() -
        useFilterListSubtractHeight()
    );
}

export function useMapHeight() {
    return useWindowHeight() - useHeaderHeight() - useFooterHeight();
}
