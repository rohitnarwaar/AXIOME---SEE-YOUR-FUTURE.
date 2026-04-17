import { useState, useEffect } from 'react';

export default function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.matchMedia(`(max-width: ${breakpoint}px)`).matches);
        };

        // Check initially
        checkIsMobile();

        // Add listener
        const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
        mediaQuery.addEventListener('change', checkIsMobile);

        return () => mediaQuery.removeEventListener('change', checkIsMobile);
    }, [breakpoint]);

    return isMobile;
}
