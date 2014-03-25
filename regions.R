library(reshape2)
library (ggplot2)


regions<-read.csv("C:/Users/saurabhgaur/Downloads/regions.csv")


ggplot(regions)+
  geom_rect(aes(xmin=GeneStart,xmax=GeneStop,ymin=0,ymax=0.5))+
  geom_rect(aes(xmin=RegionStart,
                xmax=RegionStop,
                ymin=(as.integer(factor(Mark))-1)/2+0.32,
                ymax=(as.integer(factor(Mark))-1)/2+0.7,
                fill=Mark,
                alpha=0.1)
            )+
  facet_grid(Gene~.,scales="free_x")+
  theme_bw()+
  theme(axis.ticks = element_blank(), 
        axis.text.y = element_blank(),
        strip.text.y = element_text(angle=0,size=rel(0.8)))

ggsave("c:/temp/thin-grid-A3.pdf",width=16.5,height=11.7, units="in")
ggsave("c:/temp/thin-grid-A3-Portrait.pdf",width=11.7,height=16.5, units="in")

ggplot(regions)+
  geom_rect(aes(xmin=GeneStart,xmax=GeneStop,ymin=0,ymax=0.25))+
  geom_rect(aes(xmin=RegionStart,
                xmax=RegionStop,
                ymin=(as.integer(factor(Mark))-1)/2+0.32,
                ymax=(as.integer(factor(Mark))-1)/2+0.7,
                fill=Mark,
                alpha=0.1)
            )+
  facet_wrap(~Gene,scales="free_x")+
  theme_bw()+
  theme(axis.ticks = element_blank(), axis.text.y = element_blank())
ggsave("c:/temp/grid-A3.pdf",width=16.5,height=11.7, units="in")

