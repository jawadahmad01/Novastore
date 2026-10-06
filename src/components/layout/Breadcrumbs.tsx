import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = "" }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-stone-500 py-3 ${className}`}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-stone-900 transition-colors"
            title="Go to Homepage"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              <li aria-hidden="true" className="text-stone-400">
                <ChevronRight className="w-3 h-3" />
              </li>
              <li>
                {isLast || !item.href ? (
                  <span className="font-medium text-stone-900 truncate max-w-[200px] sm:max-w-none inline-block">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="hover:text-stone-900 transition-colors truncate max-w-[150px] inline-block"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
