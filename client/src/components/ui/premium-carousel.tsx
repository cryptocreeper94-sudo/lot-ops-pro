import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PremiumCarouselProps {
  children: React.ReactNode
  className?: string
  showArrows?: boolean
  showDots?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  loop?: boolean
  slidesToShow?: number
  gap?: number
}

export function PremiumCarousel({
  children,
  className,
  showArrows = true,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 4000,
  loop = false,
  slidesToShow = 1,
  gap = 16
}: PremiumCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop,
    align: "start",
    slidesToScroll: 1
  })
  
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = React.useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    setScrollSnaps(emblaApi.scrollSnapList())
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)

    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi])

  React.useEffect(() => {
    if (!autoPlay || !emblaApi) return

    const intervalId = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext()
      } else if (loop) {
        emblaApi.scrollTo(0)
      }
    }, autoPlayInterval)

    return () => clearInterval(intervalId)
  }, [autoPlay, autoPlayInterval, emblaApi, loop])

  const slideWidth = `calc(${100 / slidesToShow}% - ${(gap * (slidesToShow - 1)) / slidesToShow}px)`

  return (
    <div className={cn("relative group", className)}>
      <div ref={emblaRef} className="overflow-hidden rounded-xl">
        <div className="flex" style={{ gap: `${gap}px` }}>
          {React.Children.map(children, (child, index) => (
            <motion.div
              key={index}
              className="flex-shrink-0"
              style={{ width: slideWidth }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              {child}
            </motion.div>
          ))}
        </div>
      </div>

      {showArrows && (
        <>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: canScrollPrev ? 1 : 0.3, x: 0 }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={cn(
                "h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm",
                "border-2 border-primary/30 shadow-lg",
                "hover:bg-primary/20 hover:border-primary/50 hover:scale-110",
                "transition-all duration-300",
                "disabled:opacity-30 disabled:hover:scale-100"
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: canScrollNext ? 1 : 0.3, x: 0 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={cn(
                "h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm",
                "border-2 border-primary/30 shadow-lg",
                "hover:bg-primary/20 hover:border-primary/50 hover:scale-110",
                "transition-all duration-300",
                "disabled:opacity-30 disabled:hover:scale-100"
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </>
      )}

      {showDots && scrollSnaps.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === selectedIndex
                  ? "bg-primary w-6 shadow-[0_0_10px] shadow-primary/50"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface SwipeCarouselProps {
  children: React.ReactNode
  className?: string
  itemWidth?: string
  gap?: number
  showPeek?: boolean
}

export function SwipeCarousel({
  children,
  className,
  itemWidth = "280px",
  gap = 16,
  showPeek = true
}: SwipeCarouselProps) {
  return (
    <div 
      className={cn(
        "overflow-x-auto scrollbar-hide snap-x snap-mandatory",
        showPeek && "-mx-4 px-4",
        className
      )}
    >
      <div 
        className="flex pb-4"
        style={{ gap: `${gap}px` }}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            className="flex-shrink-0 snap-start"
            style={{ width: itemWidth }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

interface HorizontalScrollProps {
  children: React.ReactNode
  className?: string
  gap?: number
}

export function HorizontalScroll({
  children,
  className,
  gap = 12
}: HorizontalScrollProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const checkScroll = React.useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  React.useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener("scroll", checkScroll)
      window.addEventListener("resize", checkScroll)
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [checkScroll])

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    })
  }

  return (
    <div className={cn("relative group", className)}>
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-background to-transparent z-10 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("left")}
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide flex pb-4"
        style={{ gap: `${gap}px` }}
      >
        {children}
      </div>

      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent z-10 flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("right")}
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
